import { useState, useEffect, useRef } from 'react';
import { useProducts } from './useProducts';

export default function App() {
  const [searched, setSearched] = useState('');
  const [isClickedShoppingCard, setIsClickedShoppingCad] = useState(false);
  const [clickedProduct, setClickedProduct] = useState(null);
  const [shoppingCard, setShoppingCard] = useState([]);
  const [inWallet, setInWallet] = useState(200);
  const [selectedCat, setSelectedCat] = useState('');
  const [firstEl, setFirstEl] = useState(0);

  const query = `products/?title=${searched + `&offset=${firstEl}&limit=20`}${selectedCat && `&categorySlug=` + selectedCat}`;

  const { isLoading, error, products } = useProducts(searched, query);

  function handleAddProduct(val) {
    const product = shoppingCard.find(el => el.id === clickedProduct.id);
    if (!product) {
      setShoppingCard(products => [...products, val]);
      setIsClickedShoppingCad(true);
      setClickedProduct(false);
    }
  }

  function handleDeleteItem(id) {
    setShoppingCard(products => products.filter(product => product.id !== id));
  }

  function handleClearShoppingCard() {
    setShoppingCard([]);
    setIsClickedShoppingCad(false);
  }

  useEffect(function(){
    if(clickedProduct) document.querySelector('body').style.overflow = "hidden";
    else document.querySelector('body').style.overflowY = "scroll";
  }, [clickedProduct])

  return (
    <div className="container">
      {clickedProduct && <PopUp
        product={clickedProduct}
        onClickedProduct={setClickedProduct}
        onAddProduct={handleAddProduct}
      />}
      <Header />
      <Main>
        <Search
          searched={searched}
          onSearched={setSearched}
          inWallet={inWallet}
          selectedCat={selectedCat}
          onSelectedCat={setSelectedCat}
          setFirstEl={setFirstEl}
        >
          <ShoppingCardIcon
            onIsClickedShoppingCad={setIsClickedShoppingCad}
            isClickedShoppingCard={isClickedShoppingCard}
          />
        </Search>
        {isLoading && <Loading />}
        {error && <Error title={error} />}
        {!isLoading && !error &&
          <Products
            products={products}
            searched={searched}
            onClickedProduct={setClickedProduct}
          />
        }
        <ShoppingCard
          shoppingCard={shoppingCard}
          isClickedShoppingCard={isClickedShoppingCard}
          setInWallet={setInWallet}
          onClearShoppingCard={handleClearShoppingCard}
          onIsClickedShoppingCad={setIsClickedShoppingCad}
          inWallet={inWallet}
        >
          <ShoppingCardProducts
            shoppingCard={shoppingCard}
            onDeleteItem={handleDeleteItem}
          />
        </ShoppingCard >
        <Pagination onFirstEl={setFirstEl} firstEl={firstEl} products={products} />
      </Main>

      <Footer />
    </div>
  )
}

function Loading() {
  return (
    <span>Loading...</span>
  )
}

function Error({ titleErr }) {
  return (
    <span>{titleErr}</span>
  )
}

function Header() {
  return (
    <header>
      <h1>Shop Market 2.0</h1>
    </header>
  )
}

function Button({ title, callback, pos = "right", color = "var(--txtColor)", bgColor = "var(--bgColor3)", value = null }) {
  const styles = {
    backgroundColor: bgColor,
    color: color,
    margin: '5px ',
    padding: '5px 15px',
    fontWeight: '600',
    border: '0',
    cursor: 'pointer',
    float: pos,
  }

  return (
    <button value={value} style={styles} className="button" onClick={callback}>{title}</button>
  )
}

function Main({ children }) {
  return (
    <main>
      {children}
    </main>
  )
}

function Search({ children, searched, onSearched, inWallet, onSelectedCat, selectedCat, setFirstEl }) {

  const { products: categories } = useProducts(searched, `categories/`);

  function handleCat(e) {
    onSelectedCat(e.target.value);
    setFirstEl(0)
  }

  return (
    <div className="search">
      <div>
        <span className="loupe">⌕</span>
        <input type="text" placeholder="Search product" value={searched} onChange={(e) => onSearched(e.target.value)} />
        {searched && <span className="close" onClick={() => onSearched('')} >&times; </span>}

        <div className="category">
          <label>Category: </label>
          <select value={selectedCat} onChange={e => handleCat(e)}>
            <option value="">All</option>
            {categories.map(el => el.id <= 5 && <option key={el.slug} value={el.slug}>{el.name}</option>)}
          </select>
        </div>

      </div>
      <span className="total-cost">Your money: ${inWallet.toFixed(2)}</span>
      {children}
    </div>
  )
}

function Products({ products, searched, onClickedProduct }) {

  return (
    <section className="products">
      {products.length > 0
        ? products.map(product =>
          product.id !== 131
          && product.images[0].indexOf('.jfif') === -1
          && product.images[0].indexOf('40') === -1
          && product.title.indexOf('Test') === -1
          && <Product
            product={product}
            key={product.id}
            onClickedProduct={onClickedProduct} />)
        : <span>Not find any products</span>
      }
    </section>
  )
}

function Product({ product, onClickedProduct }) {

  return (
    <div className="product" onClick={() => onClickedProduct(product)} title={product.slug}>
      <img src={product.images[0]} alt={'image ' + product.title} />
      <h3>{product.title.length > 35 ? product.title.slice(0, 35) + "..." : product.title}</h3>
      <span className="cost">${product.price.toFixed(2)} </span>
      <p>{product.description.slice(0, 100)}...</p>
    </div>
  )
}

function PopUp({ product, onClickedProduct, onAddProduct }) {
  const [activeImg, setActiveImg] = useState(0);

  useEffect(function () {
    document.addEventListener('keydown', function (e) {
      if (e.code === "Escape") {
        onClickedProduct(null);
      }
    })
  }, [onClickedProduct]);

  function handleAdd() {
    activeImg < product.images.length - 1 ? setActiveImg(val => val + 1) : setActiveImg(0);
  }
  function handleSubstract() {
    activeImg > 0 ? setActiveImg(val => val - 1) : setActiveImg(product.images.length - 1);
  }

  useEffect(function () {
    document.title = "Shop Market 2.0 | " + product.title;

    return function () {
      document.title = "Shop Market 2.0";
    }
  }, [product])

  return (
    <div className="popup">
      <div className="popup-product">
        <div className="show-image">
          <button className="previous" onClick={handleSubstract} >&lsaquo;</button>
          <button className="next" onClick={handleAdd}>&rsaquo;</button>
          {product.images.map((image, i) => <ProductImage imageIndex={image} activeImg={activeImg} num={i} key={i} />)}
          <div className="figcaption">
            {product.images.map((image, i) => <ImagesList image={image} onActiveImg={setActiveImg} activeImg={activeImg} num={i} key={i} />)}
          </div>
        </div>
        <div>
          <div className="name-n-cost">
            <h3>{product.title}</h3>
            <span >${product.price.toFixed(2)}</span>
          </div>
          <p>Category: {product.category.name}</p>
          <p>{product.description}</p>
          <Button title="Add to card" callback={() => onAddProduct(product)} />
        </div>
        <span className="close-popup" onClick={() => onClickedProduct(null)}>&times;</span>
      </div>
    </div>
  )
}

function ProductImage({ imageIndex, activeImg, num }) {
  return (
    <>
      {activeImg === num && <img src={imageIndex} className="active-image" alt={'image ' + imageIndex} />}
    </>
  )
}

function ImagesList({ image, num, activeImg, onActiveImg }) {
  return (
    <>
      <img src={image} alt={"image " + num} className={activeImg === num ? 'active-img' : ''} onClick={() => onActiveImg(num)} />
    </>
  )
}


function ShoppingCardIcon({ onIsClickedShoppingCad, isClickedShoppingCard }) {

  return (
    <span className={isClickedShoppingCard
      ? 'shopping-card-icon animateShopIcon'
      : 'shopping-card-icon'} onClick={() => onIsClickedShoppingCad(val => !val)}>🛒</span>
  )
}
function ShoppingCard({ children, onIsClickedShoppingCad, shoppingCard, isClickedShoppingCard, setInWallet, onClearShoppingCard, inWallet }) {
  const costs = shoppingCard.map(el => el.price)
  const totalCost = costs.length > 0 ? costs.reduce((acc, el) => acc + el) : '';
  const buyedProducts = useRef(0);

  function handleBuy() {
    if (shoppingCard.length === 0 || inWallet < totalCost) return;

    const isBuy = window.confirm(`Do you want buy ${shoppingCard.length} products for $${totalCost}?`)
    if (isBuy) {
      setInWallet(money => money - totalCost);
      onClearShoppingCard();

      buyedProducts.current += shoppingCard.length;
    }
  }

  return (
    <section className={isClickedShoppingCard ? 'shopping-card open-shopping-card' : 'shopping-card'}>
      <div>
        <div>
          <span className="total-cost">{!totalCost ? "Add products! :D" : `Total cost: $${totalCost.toFixed(2)}`}</span>
          <span className="close-shopping-card" onClick={() => onIsClickedShoppingCad(val => !val)}>&#x2212;</span>
        </div>
        <h4>Your Products:</h4>
      </div>
      {children}
      <Button title="Buy" callback={handleBuy} />
      <Button title="Clear List" callback={onClearShoppingCard} bgColor="#4f5d75" color="white" />
    </section>
  )
}

function ShoppingCardProducts({ shoppingCard, onDeleteItem }) {
  return (
    <div >
      {shoppingCard.map(product => <ShoppingCardProduct key={product.id} product={product} onDeleteItem={onDeleteItem} />)}
    </div>
  )
}

function ShoppingCardProduct({ product, onDeleteItem }) {
  return (
    <div className="shopping-card-product">
      <div className="shopping-card-description-product">
        <img src={product.images[0]} alt="image2" />
        <div>
          <h4>{product.title.length > 65 ? product.title.slice(0, 65) + "..." : product.title}</h4>
          <span>${product.price.toFixed(2)}</span>
        </div>
      </div>
      <span className="close-product" onClick={() => onDeleteItem((product.id))}>&times;</span>
    </div>
  )
}

function Pagination({ onFirstEl,firstEl }) {
  const [activeCard, setActiveCard] = useState(1);

  function handlePage(e) {
    onFirstEl(() => Number(e.target.value))
  }

  return (
    <div className="pagination">
      <Button title="<" callback={() => onFirstEl(val => val - 20 >= 0 ? val - 20 : val)} />
      {/* <Button value={0} title="1" callback={(e) => handlePage(e)} />
      <Button value={20} title="2" callback={(e) => handlePage(e)} />
      <Button value={40} title="3" callback={(e) => handlePage(e)} /> */}
      {Array.from({length:4}, (_,i) => i + 1).map(btn => <Button value={firstEl} title={btn} callback={(e) => handlePage(e)} />)}
      <Button title=">" callback={() => onFirstEl(val => val + 20 <= 40  ? val + 20 : val)} />
    </div>
  )
}

function Footer() {
  return (
    <footer>
      <span>created by: Patryk</span>
    </footer>
  )
}