import { useState } from "react";
import AccordionItem from "../components/accordion-item";
import SectionTitle from "../components/section-title";
import { FAQ_ITEMS } from "../config";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(1);

  return (
    <section className="w-full px-4">
      <div className="mx-auto mt-24 w-full max-w-[1000px] md:mt-30">
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        <p className="mt-5 text-center text-lg font-light leading-[150%] text-[#444C59]">
          Everything you need to know about Liminal and how it works.
        </p>
        <div className="mt-14">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              open={openIndex === index}
              onToggle={() => setOpenIndex(current => current === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
