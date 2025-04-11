import '../styles/LoadingScreen.css';

function LoadingScreen() {
    return (
      <div className="analysis-container">
        <div className="analysisCard">
          <h1 className="loadingTitle">Analyzing Product</h1>
          <div className="loadingContainer">
            <div className="loadingSpinner"></div>
            <p className="loadingText">Processing sentiment analysis</p>
          </div>
        </div>
      </div>
    );
  }
  
export default LoadingScreen;
