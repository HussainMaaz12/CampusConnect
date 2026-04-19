import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
                <p className="text-zinc-400 mb-6">Page not found</p>
                <Link
                    to="/"
                    className="bg-orange-500 hover:bg-orange-600 px-5 py-3 rounded-xl text-black font-semibold"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}

export default NotFound;