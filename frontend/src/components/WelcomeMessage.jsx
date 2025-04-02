import { Search, BarChart2, Save, GitCompare } from 'lucide-react';
import '../styles/WelcomeMessage.css';

function WelcomeMessage() {
  return (
    <div className="container">
      <div className="welcomeCard">
        <div className="welcomeContent">
          <div className="welcomeHeader">
            <div className="welcomeSubtitle">Welcome to</div>
            <div className="welcomeTitle">Sentimentor</div>
            <div className="welcomeAuthor">by Luke Corcoran</div>
          </div>

          <div className="instructionsSection">
            <p className="instructionsTitle">To begin:</p>
            <div className="instructionsGrid">
              {[
                {
                  icon: <Search className="icon" />,
                  text: "Search for a product using the search bar.",
                },
                {
                  icon: <BarChart2 className="icon" />,
                  text: 'Click "Analyze" to generate a detailed sentiment analysis.',
                },
                {
                  icon: <Save className="icon" />,
                  text: "Save products you've analyzed to compare later.",
                },
                {
                  icon: <GitCompare className="icon" />,
                  text: 'Use the "Compare Product" icon to compare saved products side-by-side.',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="instructionItem"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="instructionIcon">
                    {item.icon}
                  </div>
                  <p className="instructionText">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="enjoyText">Enjoy!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeMessage;
