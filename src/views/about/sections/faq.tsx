import { useState } from "react";
import AccordionItem from "../components/accordion-item";
import SectionTitle from "../components/section-title";
import { FAQ_ITEMS } from "../config";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="w-full px-4">
      <div className="mx-auto mt-20 w-full max-w-[1000px] md:mt-30">
        <SectionTitle align="left" className="max-w-[292px] text-[32px] md:max-w-none md:text-center md:text-[42px]">Frequently Asked Questions</SectionTitle>
        <p className="mt-5 hidden text-center text-lg font-light leading-[150%] text-[#444C59] md:block">
          Everything you need to know about Liminal and how it works.
        </p>
        <div className="mt-5 md:mt-14">
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
