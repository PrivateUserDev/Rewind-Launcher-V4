import "../styles/Frame.css";
import { IoCloseOutline } from "react-icons/io5";
import { BiMinus } from "react-icons/bi";
import { Window } from '@tauri-apps/api/window';
import { useTheme } from '../contexts/ThemeContext';

const TitleBar: React.FC = () => {
  const { currentTheme } = useTheme();

  const minimize = async () => {
    try {
      const window = Window.getCurrent();
      await window.minimize();
    } catch (error) {
      console.error("error!", error);
    }
  };

  const close = async () => {
    try {
      const window = Window.getCurrent();
      await window.close();
    } catch (error) {
      console.error("error!", error);
    }
  };

  return (
    <div className="tauriFrameContainer">
      <nav
        data-tauri-drag-region
        className="tauriFrame"
        style={{ background: currentTheme.colors.titlebar }}
      >
        <div className="absolute inset-0 backdrop-blur-md pointer-events-none"></div>
        <div data-tauri-drag-region className="tauriFrameInner relative z-10">
          <div data-tauri-drag-region className="flex-1 flex items-center">
            <span className="text-white/70 text-[12px] font-['Bricolage_Grotesque'] select-none ml-2 mt-0.5">
              Release 0.0.15
            </span>
          </div>
          <div className="tauriFrameControls">
            <button 
              className="tauriFrameAction opacity-50 hover:opacity-100 transition-opacity duration-200"
              onClick={minimize}
            >
              <BiMinus size={18} className="text-white" />
            </button>
            <button 
              className="tauriFrameAction close opacity-50 hover:opacity-100 transition-opacity duration-200"
              onClick={close}
            >
              <IoCloseOutline size={20} className="text-white" />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default TitleBar;
