import  Navbar from '../components/Navbar';

export default function CalculadoraMecanica() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-secondary mb-6">Calculadora Mecânica</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-500 mb-8">
            Esta é uma página de demonstração para a Calculadora Mecânica. 
            Em uma implementação real, aqui estaria a calculadora para cálculos mecânicos específicos.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600 italic">
              Página em desenvolvimento. Os recursos da calculadora serão implementados em breve.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
 