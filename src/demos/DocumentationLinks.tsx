const DocumentationLinks = () => {
  return (
    <div className="w-full flex flex-col items-start gap-4">
      <div className="item flex gap-2">
        <span className="span">Ant Design:</span>
        <a className="link" href="https://ant.design/components/overview" target="_blank" rel="noopener noreferrer">https://ant.design</a>
      </div>
      <div className="item flex gap-2">
        <span className="span">ECharts:</span>
        <a className="link" href="https://echarts.apache.org/examples/en/index.html" target="_blank" rel="noopener noreferrer">https://echarts.apache.org</a>
      </div>
      <div className="item flex gap-2">
        <span className="span">Tailwind:</span>
        <a className="link" href="https://tailwindcss.com/docs/styling-with-utility-classes" target="_blank" rel="noopener noreferrer">https://tailwindcss.com</a>
      </div>
      <div className="item flex gap-2">
        <span className="span">SweetAlert2:</span>
        <a className="link" href="https://sweetalert2.github.io/" target="_blank" rel="noopener noreferrer">https://sweetalert2.github.io/</a>
      </div>
      <div className="item flex gap-2">
        <span className="span">Toastify:</span>
        <a className="link" href="https://fkhadra.github.io/react-toastify/introduction/" target="_blank" rel="noopener noreferrer">https://fkhadra.github.io/react-toastify/introduction/</a>
      </div>
      <div className="item flex gap-2">
        <span className="span">Kit — convenciones:</span>
        <span className="text-tinta-secundaria">docs/CONVENCIONES_FRONTEND.md</span>
      </div>
      <div className="item flex gap-2">
        <span className="span">Kit — adopción:</span>
        <span className="text-tinta-secundaria">docs/ADOPCION.md</span>
      </div>
    </div>
  );
};

export default DocumentationLinks;
