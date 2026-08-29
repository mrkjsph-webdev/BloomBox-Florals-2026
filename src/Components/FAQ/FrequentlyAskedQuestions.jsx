import "./FAQ.css";

function FrequentlyAskedQuestions() {
  return (
    <section className="faq-section">

      {/* ================= HEADER ================= */}

      <div className="faq-header">
        <p>Frequently Asked Questions</p>

        <h3>
          Find answers to common questions about our services.
        </h3>
      </div>


      {/* ================= ACCORDION ================= */}

      <div
        className="accordion accordion-flush faq-accordion"
        id="accordionFlushExample"
      >

        {/* FAQ 1 */}
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#flush-collapseOne"
              aria-expanded="false"
              aria-controls="flush-collapseOne"
            >
              How do I build my own bouquet?
            </button>
          </h2>

          <div
            id="flush-collapseOne"
            className="accordion-collapse collapse"
            data-bs-parent="#accordionFlushExample"
          >
            <div className="accordion-body">
              Choose the flowers you like from our selection and
              customize your bouquet according to your preferred
              style and occasion.
            </div>
          </div>
        </div>


        {/* FAQ 2 */}
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#flush-collapseTwo"
              aria-expanded="false"
              aria-controls="flush-collapseTwo"
            >
              Can I choose different types of flowers?
            </button>
          </h2>

          <div
            id="flush-collapseTwo"
            className="accordion-collapse collapse"
            data-bs-parent="#accordionFlushExample"
          >
            <div className="accordion-body">
              Yes. You can select different flowers and combine
              them to create a bouquet that matches your personal
              preference.
            </div>
          </div>
        </div>


        {/* FAQ 3 */}
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#flush-collapseThree"
              aria-expanded="false"
              aria-controls="flush-collapseThree"
            >
              What occasions can I create bouquets for?
            </button>
          </h2>

          <div
            id="flush-collapseThree"
            className="accordion-collapse collapse"
            data-bs-parent="#accordionFlushExample"
          >
            <div className="accordion-body">
              BloomBox Florals offers bouquet options for birthdays,
              anniversaries, weddings, graduations, and grand
              celebrations.
            </div>
          </div>
        </div>


        {/* FAQ 4 */}
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#flush-collapseFour"
              aria-expanded="false"
              aria-controls="flush-collapseFour"
            >
              Can I customize my bouquet?
            </button>
          </h2>

          <div
            id="flush-collapseFour"
            className="accordion-collapse collapse"
            data-bs-parent="#accordionFlushExample"
          >
            <div className="accordion-body">
              Absolutely. You can personalize your bouquet by
              selecting different flowers and creating an arrangement
              that suits your occasion.
            </div>
          </div>
        </div>


        {/* FAQ 5 */}
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#flush-collapseFive"
              aria-expanded="false"
              aria-controls="flush-collapseFive"
            >
              Do I need an account to create a bouquet?
            </button>
          </h2>

          <div
            id="flush-collapseFive"
            className="accordion-collapse collapse"
            data-bs-parent="#accordionFlushExample"
          >
            <div className="accordion-body">
              You can browse our flower selection freely, but an
              account may be required to save or complete your bouquet.
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}

export default FrequentlyAskedQuestions;