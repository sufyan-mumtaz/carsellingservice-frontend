import '../styles/globals.css';
import { Toaster } from 'react-hot-toast'; // Import Toaster from react-hot-toast

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster /> {/* Add Toaster to your app */}
    </>
  );
}

export default MyApp;
