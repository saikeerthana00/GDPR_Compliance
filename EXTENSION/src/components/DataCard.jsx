import React, { useState } from "react";
import { ChevronDown, Shield, Users, Settings, Clock } from "lucide-react";

const DataCard = ({
  title,
  description,
  whyCollectedAnswer,
  sharedWithAnswer,
  howToControlAnswer,
  howLongStoredAnswer,
  onTitleClick = () => {},
}) => {
  const [whyCollectedOpen, setWhyCollectedOpen] = useState(false);
  const [sharedWithOpen, setSharedWithOpen] = useState(false);
  const [howToControlOpen, setHowToControlOpen] = useState(false);
  const [howLongStoredOpen, setHowLongStoredOpen] = useState(false);

  const faqData = {
    whyCollected: {
      question: "Why is it collected?",
      answer: whyCollectedAnswer,
      icon: Shield,
    },
    sharedWith: {
      question: "With whom is it shared?",
      answer: sharedWithAnswer,
      icon: Users,
    },
    howToControl: {
      question: "How to control the data?",
      answer: howToControlAnswer,
      icon: Settings,
    },
    howLongStored: {
      question: "How long is it being stored?",
      answer: howLongStoredAnswer,
      icon: Clock,
    },
  };

  const stateMap = {
    whyCollected: { isOpen: whyCollectedOpen, setOpen: setWhyCollectedOpen },
    sharedWith: { isOpen: sharedWithOpen, setOpen: setSharedWithOpen },
    howToControl: { isOpen: howToControlOpen, setOpen: setHowToControlOpen },
    howLongStored: { isOpen: howLongStoredOpen, setOpen: setHowLongStoredOpen },
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm">
      <div
        className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-8 py-8 border-b border-gray-100 cursor-pointer"
        onClick={() => onTitleClick(title)}
      >
        <div className="flex items-center gap-3 mb-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {title}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-1"></div>
          </div>
        </div>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>

      <div className="p-6 space-y-4">
        {Object.entries(faqData).map(([key, item], index) => {
          const { isOpen, setOpen } = stateMap[key];
          const IconComponent = item.icon;

          return (
            <div
              key={key}
              className="group border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-200"
            >
              <button
                onClick={() => setOpen(!isOpen)}
                className="w-full px-6 py-5 text-left bg-gradient-to-r from-gray-50 to-gray-50/50 hover:from-blue-50 hover:to-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-between transition-all duration-300 group-hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg"
                        : "bg-white border-2 border-gray-200 group-hover:border-blue-300"
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 transition-colors duration-300 ${
                        isOpen
                          ? "text-white"
                          : "text-gray-500 group-hover:text-blue-500"
                      }`}
                    />
                  </div>
                  <span className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
                    {item.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-all duration-300 ${
                    isOpen ? "rotate-180 text-blue-500" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                <div className="px-6 py-5 bg-white border-t border-gray-100">
                  <div className="flex gap-4">
                    <div className="w-10 flex-shrink-0"></div>
                    <p className="text-gray-600 leading-relaxed text-sm"
                     dangerouslySetInnerHTML={{ __html: item.answer }} >
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DataCard;
