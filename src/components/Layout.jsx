// components/Layout.jsx
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar open={sidebarOpen} onClose={toggleSidebar} />
      <main className={`pt-16 transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-20' // Điều chỉnh margin khi sidebar thu gọn
      }`}>
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}