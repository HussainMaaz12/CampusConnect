import AppRoutes from "./routes/AppRoutes";
import { Analytics } from "@vercel/analytics/next"

function App() {
  return (
    <>
      <AppRoutes />
      <Analytics />
    </>
  );
}

export default App;