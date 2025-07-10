import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';

const COLORS = ['#2563eb', '#f59e42', '#10b981', '#f43f5e', '#6366f1', '#fbbf24', '#14b8a6', '#a21caf'];
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://llmdemos.hyperpg.site/demo-backend';

export default function ModelUsageCharts() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
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
      // Usar la primera fecha del array
      const firstLog = logs[0];
      const firstDate = new Date(firstLog.timestamp);
      firstDate.setDate(firstDate.getDate() - 1); // Restar un día

      const weekAfter = new Date(firstDate);
      weekAfter.setDate(firstDate.getDate() + 6);

      setStartDate(firstDate.toISOString().split('T')[0]);
      setEndDate(weekAfter.toISOString().split('T')[0]);
    }
  };

  // Función para obtener datos del endpoint
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/request-logs/`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const logs = await response.json();
      console.log('Fetched logs:', logs); // Debugging line

      setData(logs);

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
        return logDate >= startDateObj && logDate <= endDateObj;
      });

      // Agrupar por día
      const grouped = {};
      filtered.forEach(log => {
        const logDate = new Date(log.timestamp);
        const key = logDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });

        if (!grouped[key]) {
          grouped[key] = 0;
        }
        grouped[key] += 1;
      });

      // Crear todos los días del rango
      const currentDate = new Date(startDateObj);
      while (currentDate <= endDateObj) {
        const key = currentDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });

        chartData.push({
          label: key,
          value: grouped[key] || 0
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
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
    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3],
      filename: filterType === 'hour'
        ? `request-logs-${selectedDate}-hourly.pdf`
        : `request-logs-${startDate}-to-${endDate}-daily.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: {
        scale: 1.5,
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
        orientation: 'landscape',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    html2pdf().set(opt).from(element).save();
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

          <div className="flex ml-auto gap-2">
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
      <div ref={chartRef} className="bg-white w-full max-w-4xl" style={{ padding: '15px' }}>
        {/* Header para PDF */}
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-1">
            Hyper-Y Request Analytics Report
          </h1>
          <p className="text-base text-gray-600">
            {filterType === 'hour'
              ? `Hourly Distribution - ${new Date(selectedDate).toLocaleDateString()}`
              : `Daily Distribution - ${startDate ? new Date(startDate).toLocaleDateString() : ''} to ${endDate ? new Date(endDate).toLocaleDateString() : ''}`
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Estadísticas resumen */}
        <div className="mb-4 bg-gray-50 p-3 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-800 text-sm">Summary Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600">Total Requests:</p>
              <p className="text-lg font-bold text-blue-600">
                {filteredData.reduce((sum, item) => sum + item.value, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Average per {filterType === 'hour' ? 'Hour' : 'Day'}:</p>
              <p className="text-lg font-bold text-green-600">
                {filteredData.length > 0
                  ? Math.round(filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length * 100) / 100
                  : 0
                }
              </p>
            </div>
          </div>
        </div>

        {/* Gráfica */}
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <h3 className="font-semibold mb-3 text-gray-800 text-sm">
            Request Logs - {filterType === 'hour' ? 'Hourly' : 'Daily'} Distribution
          </h3>

          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={filteredData}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
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
                <Bar dataKey="value" fill="#2563eb">
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-48">
              <div className="text-gray-500 text-sm">No data available for the selected filters</div>
            </div>
          )}
        </div>

        {/* Footer para PDF */}
        <div className="mt-4 text-center text-xs text-gray-400 border-t pt-2">
          <p>Generated by Hyper-Y Analytics Dashboard | Visit us at hyperpg.site</p>
        </div>
      </div>
    </div>
  );
}
