const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 h-[450px]">
      <div className="w-12 h-12 border-4 border-accion-borde border-t-accion rounded-full animate-spin"></div>
      <div className="text-tinta-secundaria text-subtitulo font-medium">Cargando...</div>
      <div className="text-tinta-tenue text-cuerpo">
        Por favor espere mientras se obtienen los datos
      </div>
    </div>
  );
};
export default Loading;
