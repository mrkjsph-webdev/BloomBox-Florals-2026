import { useState } from "react";

function ProductTabs() {
  const [activeTab, setActiveTab] = useState("Description"); 

  const tabs = ["Description", "Additional Information", "Reviews"];

  return (
    <div className="product-tabs">
      <div className="tab-headers">
        {tabs.map((tab) => (
          <span
            key={tab} // same thing you're looping over — what variable is that?
            className={tab === activeTab ? "tab-label active" : "tab-label"} // compare this loop item to which state variable?
            onClick={() => setActiveTab(tab)} // call setActiveTab with... which value? (hint: not activeTab)
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === "Description" && (
          <p>The Peace Lily Is One Of The Most Popular Plant/flower...</p>
        )}

        {activeTab === "Additional Information" && ( 
          <table>
        
          </table>
        )}

        {activeTab === "Reviews" && ( 
          <div>
            {/* Reviews content goes here */}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductTabs;