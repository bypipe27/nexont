import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Nexont - Home</h1>
      <Link to="/register">
        <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Ir a Registro
        </button>
      </Link>
    </div>
  );
}
export default Home;
