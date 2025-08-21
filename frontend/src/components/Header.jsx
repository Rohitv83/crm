import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <h1 className="font-bold text-xl">MyCRM</h1>
        <ul className="flex space-x-4">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/pricing">Pricing</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/login" className="bg-white text-blue-600 px-3 py-1 rounded">Login</Link></li>
        </ul>
      </div>
    </nav>
  );
}
