import React from 'react'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='container mx-auto px-6 md:px-10 lg:px-14 py-20'>
      {children}
    </div>
  )
}

export default MainLayout