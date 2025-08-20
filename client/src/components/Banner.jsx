const Banner = () => {
  const scrollToProducts = () => {
    const el = document.getElementById('products-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-gradient-to-r from-primary to-transparent rounded-2xl p-8 mb-8 text-white">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold mb-2">Bienvenido a nuestra tienda virtual</h2>
        <h3 className="text-2xl font-bold mb-2">Llevate tu cartera GRATIS</h3>
        <p className="text-lg opacity-90 mb-6">Comprá 4 vestidos y te regalamos una cartera. Promo válida para la primera compra que alcance 4 vestidos.</p>
        <button
          onClick={scrollToProducts}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:opacity-90 h-10 px-4 py-2"
          data-testid="button-view-products"
        >
          Ver vestidos
        </button>
      </div>
    </div>
  )
}

export default Banner
