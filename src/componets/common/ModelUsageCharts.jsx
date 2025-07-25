import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';

const COLORS = ['#2563eb', '#f59e42', '#10b981', '#f43f5e', '#6366f1', '#fbbf24', '#14b8a6', '#a21caf'];
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://llmdemos.hyperpg.site/demo-backend';

export default function ModelUsageCharts() {
  const [dailyTokens, setDailyTokens] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [data, setData] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [royaltiesData, setRoyaltiesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('day'); // 'hour' or 'day' - cambiado a 'day' por defecto
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const chartRef = useRef(null);

  // Función para establecer el rango de fechas por defecto
  const setDefaultDateRange = (logs) => {
    if (logs.length === 0) {
      // Si no hay datos, usar hoy como base
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 6);

      setStartDate(weekAgo.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else {
      // Encontrar la fecha más antigua en los logs
      const dates = logs.map(log => new Date(log.timestamp));
      const earliestDate = new Date(Math.min(...dates));

      // Usar la fecha más antigua como fecha de inicio (restar un día para ajuste)
      const startDateForRange = new Date(earliestDate);
      startDateForRange.setDate(startDateForRange.getDate() - 1);

      const endDateForRange = new Date(startDateForRange);
      endDateForRange.setDate(startDateForRange.getDate() + 6); // 7 días en total

      setStartDate(startDateForRange.toISOString().split('T')[0]);
      setEndDate(endDateForRange.toISOString().split('T')[0]);
    }
  };

  // Función para obtener datos del endpoint
  const fetchData = async () => {
    try {
      setLoading(true);

      // Obtener datos de request logs
      const response = await fetch(`${BACKEND_URL}/logs?limit=500`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const logsData = await response.json();
      const logs = logsData.logs || [];
      console.log('Fetched logs:', logs); // Debugging line

      setData(logs);
      setTotalRequests(logsData.total || logs.length);

      // Obtener datos de royalties
      try {
        const royaltiesResponse = await fetch(`${BACKEND_URL}/royalties`);
        if (royaltiesResponse.ok) {
          const royalties = await royaltiesResponse.json();
          console.log('Fetched royalties:', royalties); // Debugging line
          setRoyaltiesData(royalties);
        }
      } catch (royaltiesError) {
        console.warn('Error fetching royalties:', royaltiesError);
        // No fallar si no se pueden obtener las royalties
      }

      // Establecer rango por defecto solo si no se ha establecido antes
      if (!startDate && !endDate) {
        setDefaultDateRange(logs);
      }

      processData(logs, filterType, selectedDate, startDate, endDate);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para procesar datos de royalties
  const getRoyaltiesData = () => {
    if (!royaltiesData) return null;

    const processedData = {
      hypercycle: null,
      nodeOperator: null,
      licenseOwner: null,
      total: 0
    };

    Object.values(royaltiesData).forEach(item => {
      const usdcAmount = (item.currencies_total?.USDC || 0) / 1000000; // Convertir de unidades pequeñas a USDC

      switch (item.type) {
        case 'hypercycle':
          processedData.hypercycle = {
            calls: item.calls,
            usdc: usdcAmount,
            address: item.address
          };
          break;
        case 'NODE_OPERATOR':
          processedData.nodeOperator = {
            calls: item.calls,
            usdc: usdcAmount,
            address: item.address
          };
          break;
        case 'license_owner':
          processedData.licenseOwner = {
            calls: item.calls,
            usdc: usdcAmount,
            address: item.address
          };
          break;
      }

      processedData.total += usdcAmount;
    });

    return processedData;
  };

  // Función para procesar y filtrar datos
  const processData = (logs, type, singleDate, rangeStart, rangeEnd) => {
    let chartData = [];
    if (type === 'hour') {
      // Filtrar solo para el día seleccionado
      const filtered = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        const filterDate = new Date(singleDate);
        return logDate.toDateString() === filterDate.toDateString();
      });

      // Agrupar por hora
      const grouped = {};
      filtered.forEach(log => {
        const logDate = new Date(log.timestamp);
        const key = `${logDate.getHours().toString().padStart(2, '0')}:00`;

        if (!grouped[key]) {
          grouped[key] = 0;
        }
        grouped[key] += 1;
      });

      // Crear todas las horas del día (0-23)
      for (let hour = 0; hour < 24; hour++) {
        const key = `${hour.toString().padStart(2, '0')}:00`;
        chartData.push({
          label: key,
          value: grouped[key] || 0
        });
      }
    } else {
      // Para días, usar el rango de fechas
      if (!rangeStart || !rangeEnd) return;

      const startDateObj = new Date(rangeStart + 'T00:00:00');
      const endDateObj = new Date(rangeEnd + 'T23:59:59');

      // Filtrar logs dentro del rango
      const filtered = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        // Ignorar logs con output_tokens: 0
        if (log.output_tokens === 0) return false;
        return logDate >= startDateObj && logDate <= endDateObj;
      });

      console.log('Filtered logs:', filtered.length); // Debugging line


      // Agrupar por día
      const grouped = {};
      const tokensByDay = {};
      let totalTokens = 0;
      filtered.forEach(log => {
        const logDate = new Date(log.timestamp);
        const key = logDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        if (!grouped[key]) grouped[key] = 0;
        grouped[key] += 1;
        if (!tokensByDay[key]) tokensByDay[key] = 0;
        tokensByDay[key] += (log.input_tokens || 0) + (log.output_tokens || 0);
        totalTokens += (log.input_tokens || 0) + (log.output_tokens || 0);
      });
      const days = [];
      const currentDate = new Date(startDateObj);
      while (currentDate <= endDateObj) {
        const key = currentDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        chartData.push({ label: key, value: grouped[key] || 0 });
        days.push(key);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      let totalRevenue = royaltiesData ? Object.values(royaltiesData).reduce((sum, item) => sum + ((item.currencies_total?.USDC || 0) / 1000000), 0) : 0;
      const revenueByDay = {};
      days.forEach(day => {
        revenueByDay[day] = totalRevenue / days.length;
      });
      // Calculate daily revenue by multiplying tokens per day by token price
      setDailyTokens(days.map(day => ({ label: day, value: tokensByDay[day] || 0 })));
      setDailyRevenue(days.map(day => ({ label: day, value: (tokensByDay[day] || 0) * (totalTokens > 0 ? totalRevenue / totalTokens : 0) })));
      setTokenPrice(totalTokens > 0 ? totalRevenue / totalTokens : 0);
    }

    setFilteredData(chartData);
  };

  // Función para descargar datos
  const downloadData = () => {
    let dataToDownload = [];

    if (filterType === 'hour') {
      // Para horas, filtrar por día seleccionado
      dataToDownload = data.filter(log => {
        const logDate = new Date(log.timestamp);
        const filterDate = new Date(selectedDate);
        return logDate.toDateString() === filterDate.toDateString();
      });
    } else {
      // Para días, usar el rango de fechas
      if (startDate && endDate) {
        const startDateObj = new Date(startDate + 'T00:00:00');
        const endDateObj = new Date(endDate + 'T23:59:59');

        dataToDownload = data.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= startDateObj && logDate <= endDateObj;
        });
      }
    }

    const csv = [
      ['Timestamp', 'Token', 'ID'],
      ...dataToDownload.map(log => [
        log.timestamp,
        log.token,
        log._id
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    if (filterType === 'hour') {
      a.download = `request-logs-${selectedDate}-${filterType}.csv`;
    } else {
      a.download = `request-logs-${startDate}-to-${endDate}.csv`;
    }

    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Función para exportar a PDF
  const exportToPDF = () => {
    const element = chartRef.current;
    // Guardar el ancho original
    const originalWidth = element.style.width;
    // Forzar ancho para PDF (por ejemplo, 900px)
    element.style.width = '900px';

    // Esperar 500ms para que la gráfica se renderice correctamente
    setTimeout(() => {
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: filterType === 'hour'
          ? `request-logs-${selectedDate}-hourly.pdf`
          : `request-logs-${startDate}-to-${endDate}-daily.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 1,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          allowTaint: true,
          width: element.scrollWidth,
          height: element.scrollHeight
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      html2pdf().set(opt).from(element).save().then(() => {
        // Restaurar el ancho original después de exportar
        element.style.width = originalWidth;
      });
    }, 500);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      processData(data, filterType, selectedDate, startDate, endDate);
    }
  }, [data, filterType, selectedDate, startDate, endDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full items-center mt-8">
      {/* Controles de filtro */}
      <div className="bg-white rounded-lg shadow p-2 w-full max-w-4xl">
        <div className="flex flex-wrap gap-4 p-2">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Filter Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border bg-transparent h-8 rounded px-3 py-1"
            >
              <option value="day">By Day</option>
              <option value="hour">By Hour</option>
            </select>
          </div>

          {filterType === 'hour' ? (
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border bg-transparent h-8 rounded px-3 py-1"
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border bg-transparent h-8 rounded px-3 py-1"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border bg-transparent h-8 rounded px-3 py-1"
                />
              </div>
            </>
          )}

          <div className="flex ml-auto gap-2 items-end">
            <button
              onClick={downloadData}
              className="bg-blue-500 text-white h-8 px-4 py-1 rounded hover:bg-blue-600"
            >
              Download CSV
            </button>
            <button
              onClick={exportToPDF}
              className="bg-red-500 text-white h-8 px-4 py-1 rounded hover:bg-red-600"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor para PDF */}
      <div ref={chartRef} className="bg-gray-50 w-full max-w-4xl p-4 rounded-lg shadow">
        {/* Header para PDF */}
        <div className="mb-3 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Hyper-Y Request Analytics Report
          </h1>
          <p className="text-sm text-gray-600">
            {filterType === 'hour'
              ? `Hourly Distribution - ${new Date(selectedDate + 'T12:00:00').toLocaleDateString()}`
              : `Daily Distribution - ${startDate ? new Date(startDate + 'T12:00:00').toLocaleDateString() : ''} to ${endDate ? new Date(endDate + 'T12:00:00').toLocaleDateString() : ''}`
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Estadísticas resumen */}
        <div className="mb-3 bg-gray-50 p-2 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-800 text-sm">Summary of Analyzed Requests</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-600">Total requests received: </p>
              <p className="text-base font-bold text-blue-600" title="This number represents the total requests the server has received in the queried period.">
                {totalRequests}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Average requests per day:</p>
              <p className="text-base font-bold text-green-600" title="This number represents the sum of requests that match the selected filters and are visualized in the chart below.">
                {filteredData.length > 0 ? (filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length).toFixed(2) : 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Total tokens processed:</p>
              <p className="text-base font-bold text-purple-600" title="Sum of input and output tokens for all filtered requests.">
                {dailyTokens.reduce((sum, item) => sum + item.value, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Token price (Total Revenue / Total Tokens):</p>
              <p className="text-base font-bold text-orange-600" title="Calculated as total revenue divided by total tokens.">
                ⁓${tokenPrice.toFixed(6)} USDC
              </p>
            </div>
          </div>
        </div>

        {/* Royalties Data */}
        {royaltiesData && (() => {
          const royalties = getRoyaltiesData();
          return royalties && (
            <div className="mb-3 p-2 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-800 text-sm">Royalties Distribution (USDC)</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  {royalties.hypercycle && (
                    <div className="p-1.5 rounded text-xs">
                      <p className="font-medium text-gray-700">Hypercycle</p>
                      <p
                        className="text-blue-600 font-bold cursor-help"
                        title={`Exact value: $${royalties.hypercycle.usdc}`}
                      >
                        ${royalties.hypercycle.usdc.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {royalties.nodeOperator && (
                    <div className="p-1.5 rounded text-xs">
                      <p className="font-medium text-gray-700">Node Operator</p>
                      <p
                        className="text-green-600 font-bold cursor-help"
                        title={`Exact value: $${royalties.nodeOperator.usdc}`}
                      >
                        ${royalties.nodeOperator.usdc.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  {royalties.licenseOwner && (
                    <div className="p-1.5 rounded text-xs">
                      <p className="font-medium text-gray-700">License Owner</p>
                      <p
                        className="text-purple-600 font-bold cursor-help"
                        title={`Exact value: $${royalties.licenseOwner.usdc}`}
                      >
                        ${royalties.licenseOwner.usdc.toFixed(2)}
                      </p>
                    </div>
                  )}
                  <div className="p-1.5 rounded text-xs">
                    <p className="font-medium text-gray-700">Total Revenue</p>
                    <p
                      className="text-lg font-bold text-gray-800 cursor-help"
                      title={`Exact value: $${royalties.total}`}
                    >
                      ${royalties.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Daily Revenue Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-2 mt-4">
          <h3 className="font-semibold mb-2 text-gray-800 text-sm">Estimated Revenue per Day (USDC)</h3>
          {dailyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyRevenue}>
                <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={40} />
                <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
                <Tooltip content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border rounded shadow px-2 py-1 text-xs">
                        <span className="font-semibold">{label}:</span> ${payload[0].value.toFixed(2)} USDC
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar dataKey="value" fill="#f59e42" isAnimationActive={false}>
                  {dailyRevenue.map((entry, index) => (
                    <Cell key={`cell-revenue-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500 text-sm">No revenue data available for the selected filters</div>
            </div>
          )}
        </div>
        <br />
        {/* Gráfica */}
        <div className="bg-white rounded-lg shadow-sm border p-2">
          <h3 className="font-semibold mb-2 text-gray-800 text-sm">
            Request Logs - {filterType === 'hour' ? 'Hourly' : 'Daily'} Distribution
          </h3>

          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={filteredData}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={40}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
                <Tooltip content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border rounded shadow px-2 py-1 text-xs">
                        <span className="font-semibold">{label}:</span> {payload[0].value} requests
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar dataKey="value" fill="#2563eb" isAnimationActive={false}>
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500 text-sm">No data available for the selected filters</div>
            </div>
          )}
        </div>

        {/* Footer para PDF */}
        <div className="mt-3 text-center text-xs text-gray-400 border-t pt-2">
          <p>Generated by Hyper-Y Analytics Dashboard | Visit us at hyperpg.site</p>
        </div>
      </div>
    </div>
  );
}
