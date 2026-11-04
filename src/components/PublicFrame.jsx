import { Navigation, Footer } from './SiteChrome.jsx';

export default function PublicFrame({ children, className = '', onSelectProduct = () => {}, rootRef }) {
  const selectProduct = onSelectProduct;
  return (
    <div className={`site-root ${className}`.trim()} ref={rootRef}>
      <a className="skip" href="#main">Skip to content</a>
      <Navigation onSelectProduct={selectProduct} />
      <main id="main" className="commerce-main">{children}</main>
      <Footer onSelectProduct={selectProduct} />
    </div>
  );
}
