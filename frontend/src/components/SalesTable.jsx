const SalesTable = ({ salesData }) => {
  return (
    <div className="details-container">
      <h3>تقرير المبيعات بالتفصيل</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>اسم المنتج</th>
            <th>الكمية المباعة</th>
            <th>إجمالي البيع</th>
            <th>المخزون المتبقي</th>
          </tr>
        </thead>
        <tbody>
          {salesData.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.total_qty_sold || 0}</td>
              <td>{item.total_revenue_per_product || 0} ريال</td>
              <td>{item.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};