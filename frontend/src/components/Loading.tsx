export const Loading = ({ label = "Carregando" }: { label?: string }) => (
  <div className="loading" role="status">
    <span className="spinner" />
    {label}
  </div>
);
