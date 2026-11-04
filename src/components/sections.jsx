import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getApiError } from '../services/api.js';
import { formatMoney } from '../utils/commerce.js';
import {
  arrangements,
  faqItems,
  keepsakeOptions,
  makingStages,
  occasionImages,
  processSteps,
  studioNotes,
  studioSessions,
} from '../data/siteContent.js';

function ArrowGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ContactAction({ children, onSelectProduct, selection = 'Custom bouquet', className = 'm-btn' }) {
  return (
    <a className={className} href="#contact" onClick={() => onSelectProduct(selection)}>
      <span className="m-btn__label">{children}</span>
    </a>
  );
}

function RowLink({ children, onSelectProduct, selection = 'Custom bouquet', className = 'm-rowlink', href = '#contact', motion = false }) {
  return (
    <a className={className} href={href} onClick={href === '#contact' ? () => onSelectProduct(selection) : undefined}>
      <span className="m-rowlink__line" aria-hidden="true" {...(motion ? { 'data-8b-motion': 'rule' } : {})} />
      <span className="m-rowlink__label">{children}</span>
      <span className="m-icon" aria-hidden="true"><ArrowGlyph /></span>
    </a>
  );
}

export function Opening({ onSelectProduct }) {
  return (
    <section id="opening" data-8b-section="opening" aria-label="Velveteen">
      <div className="op__hold">
        <div className="op__top">
          <h1 className="op__mark m-text-7" style={{ '--len': 9 }}>
            <span className="op__w op__w--1"><span className="op__word">VELV</span></span>
            <span className="op__and"><span className="op__and-in m-text-6">by hand</span></span>
            <span className="op__w op__w--2"><span className="op__word">ETEEN</span></span>
          </h1>
          <p className="op__tag op__tag--l m-text-4">Handmade flowers<br />&amp; little keepsakes</p>
          <div className="op__right">
            <p className="op__tag op__tag--r m-text-4">Made slowly,<br />made to keep</p>
            <div className="op__actions">
              <a className="m-btn" href="#season"><span className="m-btn__label">Shop the collection</span></a>
              <ContactAction className="m-link" onSelectProduct={onSelectProduct}>Custom bouquet</ContactAction>
            </div>
          </div>
        </div>
        <figure className="op__photo">
          <div className="op__drift">
            <img
              src="/images/velveteen-hero.jpg"
              width="1900"
              height="2533"
              alt="A hand-tied bouquet of blush pipe-cleaner roses, wrapped as a handmade keepsake"
              fetchPriority="high"
            />
          </div>
        </figure>
      </div>
      <div className="op__night">
        <p className="op__label m-text-3">The studio</p>
        <p className="op__statement m-text-4">Velveteen turns soft chenille stems into handmade flowers, little bouquets and thoughtful keepsakes. Each bloom is shaped by hand, then gathered into something made for someone.</p>
        <p className="op__ribbon m-text-5" aria-hidden="true" style={{ '--len': 12 }}>made by hand</p>
        <p className="op__close m-text-3">Pipe-cleaner flowers, shaped into something personal</p>
      </div>
    </section>
  );
}

export function Season({ products = [], loading = false, error = '', onAddToCart, onSelectProduct }) {
  const [notice, setNotice] = useState('');

  const addProduct = (product) => {
    const result = onAddToCart(product);
    setNotice(result.message || '');
  };

  return (
    <section id="season" data-8b-section="season" aria-labelledby="season-title">
      <header className="bench__head">
        <p className="m-text-3">On the bench</p>
        <h2 id="season-title" className="m-text-2" data-8b-motion="lift">What we’re shaping</h2>
        <p className="bench__intro m-text">Each flower begins as a soft chenille stem, folded and shaped by hand. Choose a favourite bloom or colour, or let us gather a small mix made to keep.</p>
      </header>
      <div className="bench__frame">
        <div className="bench__deck">
          {products.map((product) => (
            <figure className="bench__ph" key={product._id}>
              <img src={product.image} width="900" height="1200" alt={`${product.name}, handmade pipe-cleaner flowers`} loading="lazy" />
            </figure>
          ))}
        </div>
      </div>
      <ol className="bench__rows" aria-live="polite">
        {loading && <li className="bench__row"><p className="m-text">Gathering the collection…</p></li>}
        {!loading && error && <li className="bench__row"><p className="m-text" role="status">{error}</p></li>}
        {!loading && !error && products.length === 0 && (
          <li className="bench__row">
            <h3 className="bench__name m-text-4">A little room on the bench</h3>
            <p className="bench__note m-text">The next handmade pieces are being prepared. Send a custom request and tell us what you have in mind.</p>
          </li>
        )}
        {products.map((product) => (
          <li className="bench__row" key={product._id}>
            <h3 className="bench__name m-text-4">{product.name}</h3>
            <p className="m-text-8">{product.category.replaceAll('-', ' ')} · {product.availability === 'made-to-order' ? 'Made to order' : 'Available'}</p>
            <p className="bench__note m-text">{product.description}</p>
            <p className="bench__price m-text-4">{formatMoney(product.price, product.currency)}</p>
            <div className="bench__actions">
              <Link className="m-link" to={`/products/${product._id}`}>View details</Link>
              <button className="m-link bench__add" type="button" onClick={() => addProduct(product)}>Add to bag</button>
            </div>
          </li>
        ))}
      </ol>
      {notice && <p className="bench__notice m-text-8" role="status">{notice}</p>}
      <div className="bench__catalog-link"><Link className="m-link" to="/products">Browse the full collection</Link></div>
      <RowLink className="bench__more m-rowlink" onSelectProduct={onSelectProduct} motion={false}>
        Build a bouquet from the bench
      </RowLink>
    </section>
  );
}

export function Work({ onSelectProduct }) {
  return (
    <section id="work" data-8b-section="work" aria-labelledby="work-title">
      <header className="work__head">
        <p className="m-text-3">Arrangements</p>
        <h2 id="work-title" className="m-text-2" data-8b-motion="lift">Small flowers, lasting stories</h2>
      </header>
      <p className="work__ribbon m-text-5" aria-hidden="true" data-8b-motion="ribbon" style={{ '--len': 14 }}>petals to keep</p>
      <ul className="work__grid">
        {arrangements.map((item) => (
          <li className="work__item" key={item.title}>
            <figure>
              <div className="work__ph">
                <img src={item.image} width="800" height="1000" alt={item.alt} loading="lazy" />
              </div>
              <figcaption>
                <span className="m-text-3">{item.title}</span>
                <span className="m-text-8">{item.caption}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <RowLink onSelectProduct={onSelectProduct} motion>
        Ask about a custom arrangement
      </RowLink>
    </section>
  );
}

export function MakingJourney() {
  return (
    <section id="dusk" data-8b-section="dusk" aria-labelledby="dusk-title">
      <header className="dusk__head">
        <p className="m-text-3">Made by hand</p>
        <h2 id="dusk-title" className="m-text-2" data-8b-motion="lift">From one stem to a keepsake</h2>
        <p className="dusk__intro m-text">A little look at the bends, petals and finishing touches that bring a handmade Velveteen flower to life.</p>
      </header>
      <div className="dusk__run">
        <div className="dusk__stage">
          <ol className="dusk__track">
            {makingStages.map((stage) => (
              <li className="dusk__panel" key={stage.number}>
                <p className="dusk__hour m-text-7">{stage.number}</p>
                <div className="dusk__copy">
                  <h3 className="m-text-4">{stage.title}</h3>
                  <p className="m-text">{stage.copy}</p>
                  {stage.ribbon && <p className="dusk__night m-text-5" aria-hidden="true" style={{ '--len': 12 }}>{stage.ribbon}</p>}
                </div>
                <figure className="dusk__ph">
                  <img src={stage.image} width="1200" height="900" alt={stage.alt} loading="lazy" />
                </figure>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function StandingOrders({ onSelectProduct }) {
  return (
    <section id="standing" data-8b-section="standing" aria-labelledby="standing-title">
      <div className="so__head">
        <p className="m-text-3">Ways to gift</p>
        <h2 id="standing-title" className="m-text-2" data-8b-motion="lift">A little gesture, made yours</h2>
        <p className="so__intro m-text">Choose one stem, a little bunch or a keepsake bouquet. Share a colour and a feeling, and we can talk through the details together.</p>
      </div>
      <div className="so__cols m-text-3" aria-hidden="true">
        <span>Piece</span><span>What comes</span><span>Best for</span><span>Price</span><span />
      </div>
      <ul className="so__rows">
        {keepsakeOptions.map((item) => (
          <li className="so__row" key={item.title}>
            <span className="so__line" aria-hidden="true" data-8b-motion="rule" />
            <h3 className="so__name m-text-4">{item.title}</h3>
            <p className="so__what m-text">{item.description}</p>
            <p className="m-text-8">{item.detail}</p>
            <p className="so__price">{item.price}</p>
            <ContactAction className="m-link" onSelectProduct={onSelectProduct} selection={item.selection}>{item.action}</ContactAction>
          </li>
        ))}
      </ul>
      <p className="so__foot m-text-8">
        <span className="so__line" aria-hidden="true" data-8b-motion="rule" />
        Each flower is handmade. Price, timing and personal details are discussed before an order is confirmed.
      </p>
    </section>
  );
}

export function Events({ onSelectProduct }) {
  return (
    <section id="events" data-8b-section="events" aria-labelledby="events-title">
      <div className="ev__head">
        <div className="ev__title">
          <p className="m-text-3">For the gathering</p>
          <h2 id="events-title" className="m-text-2" data-8b-motion="lift">Flowers for your moment</h2>
        </div>
        <div className="ev__side">
          <p className="m-text">Custom pipe-cleaner bouquets and decorative blooms bring a personal, lasting note to celebrations, birthdays and intimate tables. Share a palette, a setting or a story; we’ll shape an arrangement around it.</p>
          <ul className="ev__kinds">
            <li><span className="m-text-4">Weddings &amp; celebrations</span><span className="m-text-8">Custom bouquets · pricing by enquiry</span></li>
            <li><span className="m-text-4">Birthdays &amp; milestones</span><span className="m-text-8">Personal colours · handmade details</span></li>
            <li><span className="m-text-4">Tables &amp; gatherings</span><span className="m-text-8">Keepsake blooms · tell us your idea</span></li>
          </ul>
          <ContactAction className="m-btn-2" onSelectProduct={onSelectProduct} selection="Event flowers">Plan an event</ContactAction>
        </div>
      </div>
      <ul className="ev__board">
        {occasionImages.map((image, index) => (
          <li className="ev__ph" key={`${image.src}-${index}`}>
            <img src={image.src} width="800" height="1100" alt={image.alt} loading="lazy" />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Process() {
  return (
    <section id="growers" data-8b-section="growers" aria-labelledby="growers-title">
      <div className="gr__head">
        <p className="m-text-3">The making</p>
        <h2 id="growers-title" className="m-text-2" data-8b-motion="lift">From chenille stem to keepsake</h2>
        <p className="gr__intro m-text">Every piece begins with a thought and finishes with a handmade flower. Here are a few of the small steps in between.</p>
      </div>
      <div className="gr__scale m-text-3" aria-hidden="true">
        <span>From first idea</span>
        <span className="gr__marks"><span>Idea</span><span>Colour</span><span>Shape</span><span>Gather</span><span>Gift</span></span>
      </div>
      <ol className="gr__rows">
        {processSteps.map((step) => (
          <li className="gr__row" style={{ '--mi': step.progress }} key={step.label}>
            <div className="gr__who">
              <h3 className="m-text-4">{step.title}</h3>
              <p className="m-text-8">{step.copy}</p>
            </div>
            <div className="gr__track">
              <span className="gr__line" aria-hidden="true" />
              <span className="gr__pin m-text-3"><data value={step.progress}>{step.label}</data></span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function StudioSessions({ onSelectProduct }) {
  return (
    <section id="school" data-8b-section="school" aria-labelledby="school-title">
      <div className="sc__body">
        <p className="m-text-3">Around the flower table</p>
        <h2 id="school-title" className="m-text-2" data-8b-motion="lift">A little time with the stems</h2>
        <p className="sc__lead m-text">Curious how a chenille stem becomes a rose, tulip or sunflower? Ask the studio about a small, hands-on session. Dates and details can be discussed together.</p>
        <ul className="sc__classes">
          {studioSessions.map((session) => (
            <li className="sc__class" key={session.title}>
              <span className="sc__line" aria-hidden="true" data-8b-motion="rule" />
              <span className="m-text-3">By enquiry</span>
              <span className="m-text-4">{session.title}</span>
              <span className="m-text">{session.detail}</span>
            </li>
          ))}
        </ul>
        <ContactAction className="m-btn-2" onSelectProduct={onSelectProduct} selection="Flower-making session">Ask about a session</ContactAction>
      </div>
      <figure className="sc__ph" data-8b-motion="window">
        <img src="/images/flower-making.jpg" width="799" height="1000" alt="Hands beginning to shape a chenille stem into a handmade flower" loading="lazy" />
      </figure>
    </section>
  );
}

export function StudioNotes({ onSelectProduct }) {
  return (
    <section id="notes" data-8b-section="notes" aria-labelledby="notes-title">
      <header className="nt__head">
        <p className="m-text-3">A little note from the studio</p>
        <h2 id="notes-title" className="m-text-2" data-8b-motion="lift">A note from Velveteen</h2>
      </header>
      <p className="nt__ribbon m-text-5" aria-hidden="true" data-8b-motion="ribbon" style={{ '--len': 14 }}>dear velveteen</p>
      <article className="nt__feature">
        <div className="nt__frame">
          <img src="/images/pink-vase.jpg" width="340" height="270" alt="A softly coloured pipe-cleaner flower arrangement in a pale pink vase" loading="lazy" />
        </div>
        <div className="nt__letter m-surface">
          <p className="m-text-3">From the studio notebook</p>
          <h3 className="nt__title m-text-2">Start with a feeling</h3>
          <p className="nt__q">“Can I begin with a colour or a person, rather than knowing exactly which flowers I want?”</p>
          <p className="nt__a m-text">Absolutely. A favourite colour, a person, a moment or a few words can be the start of a custom bouquet. Roses, tulips, sunflowers and smaller blooms can be gathered into a palette that feels right for the occasion.</p>
          <p className="nt__a m-text">A note tucked into the wrap, a ribbon in a favourite shade or one tiny flower chosen just for them—small details make a handmade gift feel personal. A rough idea is plenty to begin with.</p>
          <p className="nt__sign" aria-hidden="true">Velveteen</p>
          <RowLink className="m-rowlink" onSelectProduct={onSelectProduct} selection="Custom bouquet" motion={false}>Write to the studio</RowLink>
        </div>
      </article>
      <ul className="nt__more">
        {studioNotes.map((note) => (
          <li key={note.title}>
            <p className="m-text-3">A small note</p>
            <h3 className="m-text-4">{note.title}</h3>
            <p className="m-text">{note.copy}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" data-8b-section="faq" aria-labelledby="faq-title">
      <div className="fq__head">
        <p className="m-text-3">Questions</p>
        <h2 id="faq-title" className="m-text-2" data-8b-motion="lift">Before you order</h2>
        <p className="m-text">Every custom piece is discussed before it is confirmed. If you are unsure what to ask for, a colour or a few words are a lovely place to start.</p>
      </div>
      <div className="fq__list">
        {faqItems.map((item) => (
          <details className="fq__item" key={item.question}>
            <summary>
              <span className="fq__line" aria-hidden="true" data-8b-motion="rule" />
              <span className="m-text-4">{item.question}</span>
              <span className="fq__sign" aria-hidden="true" />
            </summary>
            <p className="m-text">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Contact({ selectedProduct = 'Custom bouquet', onSelectProduct = () => {} }) {
  const [flowerType, setFlowerType] = useState(selectedProduct);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedProduct) setFlowerType(selectedProduct);
  }, [selectedProduct]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    const payload = {
      customerName: String(formData.get('customerName') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      flowerType: String(formData.get('flowerType') || flowerType).trim(),
      preferredColours: String(formData.get('preferredColours') || '').trim(),
      bouquetSize: String(formData.get('bouquetSize') || '').trim(),
      budget: String(formData.get('budget') || '').trim(),
      deliveryDate: String(formData.get('deliveryDate') || '').trim(),
      customMessage: String(formData.get('customMessage') || '').trim(),
      referenceImage: String(formData.get('referenceImage') || '').trim(),
    };

    setSubmitting(true);
    setStatus('');
    setError('');
    try {
      const { data } = await api.post('/custom-orders', payload);
      setStatus(`${data.message} Request reference: ${String(data.request.id).slice(-8).toUpperCase()}.`);
      form.reset();
      setFlowerType(selectedProduct || 'Custom bouquet');
    } catch (requestError) {
      setError(getApiError(requestError, 'Your request could not be saved. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" data-8b-section="contact" aria-labelledby="contact-title">
      <figure className="ct__room">
        <img src="/images/wide-flower-display.jpg" width="1464" height="600" alt="A colourful display of pipe-cleaner flowers arranged together" loading="lazy" />
      </figure>
      <div className="ct__card m-surface">
        <div className="ct__top">
          <p className="m-text-3">A custom request</p>
          <h2 id="contact-title" className="m-text-2">Tell us who they’re for</h2>
          <p className="m-text-8">Share a flower, palette, size and comfortable budget. The studio will review your request and confirm details before any order is placed.</p>
        </div>
        <form id="contact-form" className="ct__form" onSubmit={handleSubmit}>
          <label className="m-field">
            <span className="m-field__label">Your name</span>
            <input className="m-field__input" name="customerName" type="text" autoComplete="name" minLength="2" maxLength="120" required />
          </label>
          <label className="m-field">
            <span className="m-field__label">Email</span>
            <input className="m-field__input" name="email" type="email" autoComplete="email" maxLength="254" required />
          </label>
          <label className="m-field">
            <span className="m-field__label">Phone number</span>
            <input className="m-field__input" name="phone" type="tel" autoComplete="tel" maxLength="32" required />
          </label>
          <label className="m-field">
            <span className="m-field__label">What are you dreaming of?</span>
            <select className="m-field__input" name="flowerType" value={flowerType} onChange={(event) => { setFlowerType(event.target.value); onSelectProduct(event.target.value); }}>
              <option>Custom bouquet</option>
              <option>A little bunch</option>
              <option>Single handmade stem</option>
              <option>Roses</option>
              <option>Tulips</option>
              <option>Sunflowers</option>
              <option>Personalised handmade gift</option>
              <option>Event flowers</option>
              <option>Flower-making session</option>
            </select>
          </label>
          <label className="m-field">
            <span className="m-field__label">Preferred colours</span>
            <input className="m-field__input" name="preferredColours" type="text" maxLength="480" placeholder="For example: blush, lilac, warm ivory" />
          </label>
          <label className="m-field">
            <span className="m-field__label">Bouquet size</span>
            <select className="m-field__input" name="bouquetSize" required>
              <option value="">Choose a scale</option>
              <option>One handmade stem</option>
              <option>A small bunch</option>
              <option>A full bouquet</option>
              <option>A decorative or event piece</option>
            </select>
          </label>
          <label className="m-field">
            <span className="m-field__label">Budget or range</span>
            <input className="m-field__input" name="budget" type="text" maxLength="120" placeholder="Share a range, or ask us to advise" required />
          </label>
          <label className="m-field">
            <span className="m-field__label">Preferred delivery date</span>
            <input className="m-field__input" name="deliveryDate" type="date" />
          </label>
          <label className="m-field">
            <span className="m-field__label">Reference image URL (optional)</span>
            <input className="m-field__input" name="referenceImage" type="url" maxLength="2048" placeholder="https://…" />
          </label>
          <label className="m-field ct__wide">
            <span className="m-field__label">A note about the person or occasion</span>
            <textarea className="m-field__input" name="customMessage" rows="3" maxLength="1500" />
          </label>
          <button className="m-btn" type="submit" disabled={submitting}>
            <span className="m-btn__label">{submitting ? 'Saving your request…' : 'Send a custom request'}</span>
          </button>
          {status && <p className="ct__done m-text" role="status">{status}</p>}
          {error && <p className="ct__done m-text" role="alert">{error}</p>}
        </form>
        <dl className="ct__info">
          <div><dt className="m-text-3">The flowers</dt><dd className="m-text">Pipe-cleaner roses, tulips, sunflowers and more.</dd></div>
          <div><dt className="m-text-3">The details</dt><dd className="m-text">Choose a colour, a size and a personal note.</dd></div>
          <div><dt className="m-text-3">Made by hand</dt><dd className="m-text">Each petal is shaped from chenille, one at a time.</dd></div>
          <div><dt className="m-text-3">A little help</dt><dd><a className="m-link" href="#faq">Read the order notes</a></dd></div>
        </dl>
      </div>
    </section>
  );
}
