interface Props {
  value: 'Mailer' | 'Print' | 'Digital'
  onChange: (v: 'Mailer' | 'Print' | 'Digital') => void
}

export default function ProductTypeSelector({ value, onChange }: Props) {
  return (
    <div className="product-type-selector">
      <label htmlFor="sale-product-category">Product Category</label>
      <select
        id="sale-product-category"
        value={value}
        onChange={(event) => onChange(event.target.value as Props['value'])}
      >
        <option value="Mailer">Mailers</option>
        <option value="Digital">Digital</option>
        <option value="Print">Print</option>
      </select>
    </div>
  )
}
