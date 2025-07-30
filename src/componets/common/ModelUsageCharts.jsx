import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useState, useEffect, useRef, useCallback } from 'react';
import html2pdf from 'html2pdf.js';

const COLORS = ['#2563eb', '#f59e42', '#10b981', '#f43f5e', '#6366f1', '#fbbf24', '#14b8a6', '#a21caf'];
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://llmdemos.hyperpg.site/demo-backend';
const NODE_IDENTIFIER = import.meta.env.VITE_NODE_IDENTIFIER || '';

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [currentSkip, setCurrentSkip] = useState(0);
  const chartRef = useRef(null);

  const CHUNK_SIZE = 500; // Tamaño de cada lote de datos

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

  // Función para obtener datos del endpoint con paginación
  const fetchData = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentSkip(0);
        setData([]);
        setHasMoreData(true);
        
        // Para reset=true, cargar todos los datos automáticamente
        let allLogs = [];
        let skip = 0;
        let hasMore = true;
        let totalFromServer = 0;
        
        while (hasMore) {
          const response = await fetch(`${BACKEND_URL}/logs?limit=${CHUNK_SIZE}&skip=${skip}`);
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          const logsData = await response.json();
          const newLogs = logsData.logs || [];
          
          // Guardar el total del servidor en la primera request
          if (skip === 0) {
            totalFromServer = logsData.total || 0;
            setTotalRequests(totalFromServer);
            console.log(`Total records available: ${totalFromServer}`);
          }
          
          allLogs = [...allLogs, ...newLogs];
          hasMore = newLogs.length === CHUNK_SIZE && allLogs.length < totalFromServer;
          skip += CHUNK_SIZE;
          
          console.log(`Fetched ${newLogs.length} logs (skip: ${skip - CHUNK_SIZE}), total loaded: ${allLogs.length}/${totalFromServer}`);
        }
        
        setData(allLogs);
        setHasMoreData(false);
        setCurrentSkip(skip);
        
        // Obtener datos de royalties
        try {
          const royaltiesResponse = await fetch(`${BACKEND_URL}/royalties`);
          if (royaltiesResponse.ok) {
            const royalties = await royaltiesResponse.json();
            console.log('Fetched royalties:', royalties);
            setRoyaltiesData(royalties);
          }
        } catch (royaltiesError) {
          console.warn('Error fetching royalties:', royaltiesError);
        }

        // Establecer rango por defecto solo si no se ha establecido antes
        if (!startDate && !endDate) {
          setDefaultDateRange(allLogs);
        }
        
        // Procesar todos los datos
        processData(allLogs, filterType, selectedDate, startDate, endDate);
        
      } else {
        // Para carga incremental (Load More)
        setLoadingMore(true);
        
        const response = await fetch(`${BACKEND_URL}/logs?limit=${CHUNK_SIZE}&skip=${currentSkip}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const logsData = await response.json();
        const newLogs = logsData.logs || [];
        console.log(`Fetched ${newLogs.length} logs (skip: ${currentSkip})`);

        setData(prevData => [...prevData, ...newLogs]);
        setHasMoreData(newLogs.length === CHUNK_SIZE);
        setCurrentSkip(currentSkip + CHUNK_SIZE);

        // Procesar datos con los logs actualizados
        const allLogs = [...data, ...newLogs];
        processData(allLogs, filterType, selectedDate, startDate, endDate);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Función para cargar todos los datos automáticamente
  const loadAllData = async () => {
    setLoading(true);
    try {
      let allLogs = [];
      let skip = 0;
      let hasMore = true;
      
      while (hasMore) {
        const response = await fetch(`${BACKEND_URL}/logs?limit=${CHUNK_SIZE}&skip=${skip}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const logsData = await response.json();
        const newLogs = logsData.logs || [];
        
        allLogs = [...allLogs, ...newLogs];
        hasMore = newLogs.length === CHUNK_SIZE;
        skip += CHUNK_SIZE;
        
        console.log(`Loaded ${allLogs.length} of ${logsData.total || 'unknown'} total logs`);
      }
      
      setData(allLogs);
      setTotalRequests(allLogs.length);
      setHasMoreData(false);
      setCurrentSkip(skip);
      
      // Procesar datos
      processData(allLogs, filterType, selectedDate, startDate, endDate);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar más datos
  const loadMoreData = async () => {
    if (!hasMoreData || loadingMore) return;
    await fetchData(false);
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
  const processData = useCallback((logs, type, singleDate, rangeStart, rangeEnd) => {
    try {
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
    } catch (error) {
      console.error('Error processing data:', error);
      setError('Error processing chart data');
    }
  }, [royaltiesData]);

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
    try {
      const element = chartRef.current;
      
      if (!element) {
        alert('Error: No se pudo encontrar el elemento para exportar.');
        return;
      }
      
      const parentContainer = element.parentElement;
      
      if (!parentContainer) {
        alert('Error: No se pudo encontrar el contenedor padre.');
        return;
      }
      
      // Guardar estilos originales
      const originalElementStyles = {
        width: element.style.width,
        maxWidth: element.style.maxWidth,
        backgroundColor: element.style.backgroundColor
      };
      const originalParentStyles = {
        width: parentContainer.style.width,
        maxWidth: parentContainer.style.maxWidth
      };
      
      // Preparar elemento para PDF
      element.style.width = '800px';
      element.style.maxWidth = 'none';
      element.style.backgroundColor = '#ffffff';
      parentContainer.style.width = '800px';
      parentContainer.style.maxWidth = 'none';

      // Añadir estilos CSS para el PDF
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          .page-break-before {
            page-break-before: always !important;
            break-before: page !important;
          }
          .page-break-after {
            page-break-after: always !important;
            break-after: page !important;
          }
          .page-break-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-top: 15px !important;
          }
          .recharts-responsive-container {
            width: 100% !important;
            height: 280px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .charts-grid {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .summary-section {
            margin-bottom: 15px !important;
          }
          .chart-container {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 15px !important;
            margin-top: 10px !important;
            padding: 10px !important;
            min-height: 320px !important;
          }
          .chart-container:last-of-type {
            margin-top: 20px !important;
            margin-bottom: 20px !important;
          }
          h1 {
            font-size: 18px !important;
            margin-bottom: 5px !important;
          }
          h2 {
            font-size: 14px !important;
            margin-bottom: 8px !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          h3 {
            font-size: 12px !important;
            margin-bottom: 5px !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          /* Evitar que las gráficas se rompan */
          .recharts-wrapper {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            padding-top: 15px !important;
          }
          /* Espacio para las etiquetas superiores */
          .recharts-cartesian-grid-horizontal line:first-child {
            margin-top: 15px !important;
          }
          /* Reducir espaciado general */
          .mb-3 {
            margin-bottom: 8px !important;
          }
          .mt-3 {
            margin-top: 8px !important;
          }
          .mt-4 {
            margin-top: 10px !important;
          }
          .mt-8 {
            margin-top: 15px !important;
          }
        }
      `;
      document.head.appendChild(style);

      // Esperar que se apliquen los cambios y las gráficas se rerenderizen
      setTimeout(() => {
        try {
          const dateRange = filterType === 'hour'
            ? new Date(selectedDate + 'T12:00:00').toLocaleDateString()
            : `${startDate ? new Date(startDate + 'T12:00:00').toLocaleDateString() : ''} to ${endDate ? new Date(endDate + 'T12:00:00').toLocaleDateString() : ''}`;
          
          const opt = {
            margin: [8, 8, 8, 8], // Márgenes más pequeños para aprovechar el espacio
            filename: `Hyper-Y${NODE_IDENTIFIER ? `-${NODE_IDENTIFIER}` : ''}-Sample-Usage-Report-${dateRange.replace(/\//g, '-')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
              scale: 1.5,
              useCORS: true,
              backgroundColor: '#ffffff',
              logging: false,
              allowTaint: true,
              width: 800,
              height: element.scrollHeight
            },
            jsPDF: {
              unit: 'mm',
              format: 'legal', // Cambio de 'a4' a 'legal' (216 x 356 mm / 8.5 x 14 pulgadas)
              orientation: 'portrait',
              compress: true
            },
            pagebreak: { 
              mode: ['avoid-all', 'css', 'legacy'],
              before: '.page-break-before',
              after: '.page-break-after',
              avoid: ['.page-break-avoid', '.chart-container', '.recharts-responsive-container']
            }
          };
          
          html2pdf().set(opt).from(element).save().then(() => {
            // Restaurar estilos originales
            element.style.width = originalElementStyles.width;
            element.style.maxWidth = originalElementStyles.maxWidth;
            element.style.backgroundColor = originalElementStyles.backgroundColor;
            parentContainer.style.width = originalParentStyles.width;
            parentContainer.style.maxWidth = originalParentStyles.maxWidth;
            
            // Limpiar el estilo después de generar el PDF
            if (document.head.contains(style)) {
              document.head.removeChild(style);
            }
          }).catch((pdfError) => {
            console.error('Error generating PDF:', pdfError);
            alert('Error generando el PDF. Por favor, inténtalo de nuevo.');
            
            // Restaurar estilos en caso de error
            element.style.width = originalElementStyles.width;
            element.style.maxWidth = originalElementStyles.maxWidth;
            element.style.backgroundColor = originalElementStyles.backgroundColor;
            parentContainer.style.width = originalParentStyles.width;
            parentContainer.style.maxWidth = originalParentStyles.maxWidth;
            
            // Limpiar el estilo en caso de error
            if (document.head.contains(style)) {
              document.head.removeChild(style);
            }
          });
        } catch (dateError) {
          console.error('Error processing dates for PDF:', dateError);
          alert('Error procesando las fechas para el PDF.');
          
          // Limpiar el estilo en caso de error
          if (document.head.contains(style)) {
            document.head.removeChild(style);
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Error in exportToPDF:', error);
      alert('Error inesperado al exportar PDF. Revisa la consola para más detalles.');
    }
  };

  // Función para recargar datos cuando cambian filtros
  const refreshData = () => {
    fetchData(true);
  };

  useEffect(() => {
    fetchData(true); // Reset = true para carga inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      processData(data, filterType, selectedDate, startDate, endDate);
    }
  }, [data, filterType, selectedDate, startDate, endDate, processData]);

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
              onClick={refreshData}
              disabled={loading}
              className="bg-gray-500 text-white h-8 px-4 py-1 rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
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
            {hasMoreData && (
              <>
                <button
                  onClick={loadMoreData}
                  disabled={loadingMore}
                  className="bg-green-500 text-white h-8 px-4 py-1 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
                <button
                  onClick={loadAllData}
                  disabled={loading}
                  className="bg-purple-500 text-white h-8 px-4 py-1 rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Load All
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Indicador de datos cargados */}
        <div className="text-center text-xs text-gray-500 mt-1">
          {loading ? (
            <span className="text-blue-500">Loading all data automatically...</span>
          ) : (
            <>
              Loaded {data.length} of {totalRequests} total requests
              {data.length >= totalRequests ? (
                <span className="ml-2 text-green-500">✓ All data loaded</span>
              ) : (
                <>
                  {loadingMore && <span className="ml-2 text-blue-500">Loading more...</span>}
                  {hasMoreData && !loadingMore && (
                    <span className="ml-2 text-orange-500">({totalRequests - data.length} remaining)</span>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Contenedor para PDF */}
      <div ref={chartRef} className="bg-white w-full max-w-4xl p-4 rounded-lg shadow">
        {/* Header para PDF */}
        <div className="mb-3 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Hyper-Y {NODE_IDENTIFIER && `[${NODE_IDENTIFIER}]`} -- Sample Usage Report
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

        {/* PAGE 1: Summary and Overview */}
        <div className="summary-section page-break-avoid">
          {/* Estadísticas resumen */}
          <div className="mb-3 bg-white p-2 rounded-lg border">
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
        </div>

        {/* PAGE 2: Revenue Analysis */}
        <div className="page-break-before" style={{ minHeight: '200px' }}>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Revenue Analysis</h2>
          
          {/* Royalties Data */}
          {royaltiesData && (() => {
            const royalties = getRoyaltiesData();
            return royalties && (
              <div className="mb-3 p-2 rounded-lg page-break-avoid">
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
          <div className="bg-white rounded-lg shadow-sm border p-2 mt-4 page-break-avoid chart-container">
            <h3 className="font-semibold mb-2 text-gray-800 text-sm">Estimated Revenue per Day (USDC)</h3>
            {dailyRevenue.length > 0 && dailyRevenue.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyRevenue}>
                  <XAxis 
                    dataKey="label" 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#22c55e"
                    radius={[2, 2, 0, 0]}
                  >
                    <LabelList 
                      dataKey="value" 
                      position="top" 
                      fontSize={9}
                      formatter={(value) => `$${value.toFixed(2)}`}
                    />
                    {dailyRevenue.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="#22c55e" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 text-sm py-8">No revenue data available for the selected period</p>
            )}
          </div>
        </div>

        {/* PAGE 3: Request Statistics */}
        <div className="page-break-before" style={{ minHeight: '300px' }}>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Request Statistics</h2>
          
          {/* Gráfica de Requests */}
          <div className="bg-white rounded-lg shadow-sm border p-2 page-break-avoid chart-container">
            <h3 className="font-semibold mb-2 text-gray-800 text-sm">
              Request Logs - {filterType === 'hour' ? 'Hourly' : 'Daily'} Distribution
            </h3>

            {filteredData.length > 0 && filteredData.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={270}>
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
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    fontSize={9}
                  />
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

          {/* Token Usage Chart - Con espacio adicional antes */}
          <div className="bg-white rounded-lg shadow-sm border p-2 mt-8 page-break-avoid chart-container" style={{ marginTop: '40px' }}>
            <h3 className="font-semibold mb-2 text-gray-800 text-sm">
              Token Usage - {filterType === 'hour' ? 'Hourly' : 'Daily'} Distribution
            </h3>
            {dailyTokens.length > 0 && dailyTokens.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyTokens}>
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
                          <span className="font-semibold">{label}:</span> {payload[0].value} tokens
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Bar dataKey="value" fill="#7c3aed" isAnimationActive={false}>
                    <LabelList 
                      dataKey="value" 
                      position="top" 
                      fontSize={9}
                    />
                    {dailyTokens.map((entry, index) => (
                      <Cell key={`cell-token-${index}`} fill="#7c3aed" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-32">
                <div className="text-gray-500 text-sm">No token data available for the selected filters</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer para PDF */}
        <div className="mt-3 text-center text-xs text-gray-400 border-t pt-2">
          <p>Generated by Hyper-Y Analytics Dashboard | Visit us at hyperpg.site</p>
        </div>
      </div>
    </div>
  );
}
