import { FaBeer, FaGithub, FaTwitter } from 'react-icons/fa';

function App() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">React Icons & DaisyUI Demo</h1>
      <div className="flex items-center space-x-4">
        <p className="text-lg">Here are some icons:</p>
        <FaBeer className="text-3xl text-yellow-500" />
        <FaGithub className="text-3xl text-gray-800" />
        <FaTwitter className="text-3xl text-blue-400" />
      </div>

      <div className="card w-96 bg-base-100 shadow-xl mt-8">
        <figure><img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure>
        <div className="card-body">
          <h2 className="card-title">Shoes!</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App