import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import useAuth from '../../hooks/useAuth';
import statisticsService from '../../services/statisticsService'; // Sửa lại import

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function ThongKe() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly');
  const { user } = useAuth();

  useEffect(() => {
    fetchThongKe();
  }, [timeframe, user]);

  const fetchThongKe = async () => {
    try {
      const data = await statisticsService.getDashboardStatistics(timeframe);
      console.log('Dữ liệu từ API:', data); // In dữ liệu để kiểm tra
      setStats(data);
    } catch (error) {
      console.error('Lỗi khi lấy thống kê:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const xuHuongPhatHienData = {
    labels: stats?.timeData?.map((d) => d.date) || [],
    datasets: [
      {
        label: 'Số lần phát hiện',
        data: stats?.timeData?.map((d) => d.count) || [],
        fill: false,
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1,
      },
    ],
  };

  const phanPhoiLoaiData = {
    labels: stats?.speciesData?.map((d) => d.name) || [],
    datasets: [
      {
        label: 'Phát hiện theo loài',
        data: stats?.speciesData?.map((d) => d.count) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6 py-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Thống kê</h1>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="form-input w-auto"
        >
          <option value="daily">Hàng ngày</option>
          <option value="weekly">Hàng tuần</option>
          <option value="monthly">Hàng tháng</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ xu hướng phát hiện */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Xu hướng phát hiện</h2>
          <Line
            data={xuHuongPhatHienData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </div>

        {/* Biểu đồ phân phối loài */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Phân phối loài</h2>
          <Bar
            data={phanPhoiLoaiData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Tóm tắt thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Tổng số lần phát hiện</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats?.totalDetections || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Số loài độc nhất</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats?.uniqueSpecies || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Độ tin cậy trung bình</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats?.averageConfidence
              ? `${(stats.averageConfidence * 100).toFixed(1)}%`
              : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}