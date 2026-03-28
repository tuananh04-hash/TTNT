import './Loading.css';

const Loading = ({ fullScreen = false }) => {
  return (
    <div className={`loading-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="spinner"></div>
      <p className="loading-text">Đang tải dữ liệu...</p>
    </div>
  );
};

export default Loading;
