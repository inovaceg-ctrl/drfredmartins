import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ReturnsPolicy = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-white">Return Policy</h1>
        <div className="prose prose-invert max-w-none text-white/80">
          <p className="mb-6">Rest Recovery Wellness LLC</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">General Policy</h2>
            <p className="mb-4">
              At Rest Recovery Wellness LLC, every product is crafted, packaged, and shipped with the highest level of care and precision. Due to the specialized nature, customization, and logistics involved with our wellness equipment, all sales are considered final once an order has been processed.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Custom & Special Orders</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>All custom or made-to-order products — including but not limited to customized cold plunges, saunas, float spas, and hyperbaric chambers — are non-returnable and non-refundable.</li>
              <li>Each of these items is built, configured, or ordered specifically to your requested specifications, and cannot be resold or repurposed once production or shipment has begun.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Standard Equipment Returns</h2>
            <p className="mb-4">In rare and approved cases where a return is accepted for standard (non-custom) equipment, the following conditions apply:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Returns must be authorized in writing by Rest Recovery Wellness LLC within 7 days of delivery.</li>
              <li>The item must be unused, uninstalled, and in original packaging.</li>
              <li>The customer is responsible for all shipping, handling, and insurance costs related to the return.</li>
              <li>A 50% restocking fee will apply to all returned Cold Plunges, Saunas, Hyperbaric Chambers, and Float Spas. This fee covers freight costs, repackaging, handling, inspection, and storage associated with these large-scale units.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Restocking Fee Justification</h2>
            <p className="mb-4">The 50% restocking fee exists because of the significant logistical and operational expenses involved in handling large-format equipment. These include:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>High two-way freight and delivery costs</li>
              <li>Repackaging, inspection, and cleaning requirements</li>
              <li>Warehouse storage fees for oversized units</li>
              <li>Loss of resale value due to product handling and depreciation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Damaged or Defective Items</h2>
            <p className="mb-4">If your order arrives damaged or defective:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You must report all damage within 48 hours of delivery with photos of the product and packaging.</li>
              <li>We will assess and, if applicable, replace or repair the damaged item under warranty coverage.</li>
              <li>Failure to report within the stated timeframe may void eligibility for replacement.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Order Cancellations</h2>
            <p className="mb-4">
              All orders are final once production or shipment begins. Orders canceled prior to shipping may still incur up to a 25% processing fee, depending on the stage of fulfillment.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Non-Returnable Items</h2>
            <p className="mb-4">The following products are strictly non-returnable and non-refundable:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Custom-built or made-to-order items</li>
              <li>Any product installed, used, or altered in any way</li>
              <li>Consumable or hygiene-sensitive items (e.g., filters, tubing, salt, accessories)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Acknowledgment</h2>
            <p className="mb-4">
              By completing your purchase, you acknowledge and agree to this Return & Restocking Policy as part of the terms and conditions of sale with Rest Recovery Wellness LLC.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReturnsPolicy;
