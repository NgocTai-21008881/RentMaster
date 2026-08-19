import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans">
        <h1 className="text-3xl font-bold text-primary text-center pt-20">
          🏠 RentMaster
        </h1>
        <p className="text-center text-gray-500 mt-2">
          Hệ thống SaaS Quản lý Bất động sản Cho thuê
        </p>
      </div>
    </BrowserRouter>
  );
}

export default App;
