import React, { useEffect, useState } from "react";
import "./App.css";

function App() {

  // --- State Management ---
  const [isInstagramRequest, setIsInstagramRequest] = useState(false);
  const [isInstagramDownload, setIsInstagramDownload] = useState(false);
  const [isTikTokRequest, setIsTikTokRequest] = useState(false);
  const [isTikTokDownload, setIsTikTokDownload] = useState(false);
  const [isYouTubeRequest, setIsYouTubeRequest] = useState(false);
  const [isYouTubeDownload, setIsYouTubeDownload] = useState(false);

  const [isInstagramRequestEnabler, setIsInstagramRequestEnabler] = useState(false);
  const [isInstagramDownloadEnabler, setIsInstagramDownloadEnabler] = useState(false);
  const [isTikTokRequestEnabler, setIsTikTokRequestEnabler] = useState(false);
  const [isTikTokDownloadEnabler, setIsTikTokDownloadEnabler] = useState(false);
  const [isYouTubeRequestEnabler, setIsYouTubeRequestEnabler] = useState(false);
  const [isYouTubeDownloadEnabler, setIsYouTubeDownloadEnabler] = useState(false);

  // --- Target URLs ---
  const platformUrls = {
    instagram: "https://accountscenter.instagram.com/info_and_permissions/dyi/",
    tiktok: "https://www.tiktok.com/setting/download-your-data",
    youtube: "https://takeout.google.com/",
  };

  // --- Enable/Disable Helper Functions ---
  const stopAll = () => {
    setIsInstagramRequestEnabler(false);
    setIsInstagramDownloadEnabler(false);
    setIsTikTokRequestEnabler(false);
    setIsTikTokDownloadEnabler(false);
    setIsYouTubeRequestEnabler(false);
    setIsYouTubeDownloadEnabler(false);
  };

  const startAll = () => {
    setIsInstagramRequestEnabler(true);
    setIsInstagramDownloadEnabler(true);
    setIsTikTokRequestEnabler(true);
    setIsTikTokDownloadEnabler(true);
    setIsYouTubeRequestEnabler(true);
    setIsYouTubeDownloadEnabler(true);
  };

  // --- Check current tab URL to enable relevant buttons ---
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeUrl = tabs[0]?.url || "";

      setIsInstagramRequestEnabler(activeUrl.startsWith(platformUrls.instagram));
      setIsInstagramDownloadEnabler(activeUrl.startsWith(platformUrls.instagram));

      setIsTikTokRequestEnabler(activeUrl.startsWith(platformUrls.tiktok));
      setIsTikTokDownloadEnabler(activeUrl.startsWith(platformUrls.tiktok));

      setIsYouTubeRequestEnabler(activeUrl.startsWith(platformUrls.youtube));
      setIsYouTubeDownloadEnabler(activeUrl.startsWith(platformUrls.youtube));
    });
  }, []);

  // --- Dashboard Handlers ---
  const handleUploadButtonClickInstagram = () => window.open("InstagramDashboard.html", "_blank");
  const handleUploadButtonClickTikTok = () => window.open("TikTokDashboard.html", "_blank");
  const handleUploadButtonClickYouTube = () => window.open("YouTubeDashboard.html", "_blank");

  // --- Toggle Logic (Request / Download) ---
  const toggleRunningInstagramStateRequest = () =>
    toggleAutomation("isInstagramRequest", isInstagramRequest, setIsInstagramRequest, automateInstagramClicksRequest, stopInstagramClicksRequest, setIsInstagramRequestEnabler);

  const toggleRunningTikTokStateRequest = () =>
    toggleAutomation("isTikTokRequest", isTikTokRequest, setIsTikTokRequest, automateTikTokClicksRequest, stopTikTokClicksRequest, setIsTikTokRequestEnabler);

  const toggleRunningYouTubeStateRequest = () =>
    toggleAutomation("isYouTubeRequest", isYouTubeRequest, setIsYouTubeRequest, automateYouTubeClicksRequest, stopYouTubeClicksRequest, setIsYouTubeRequestEnabler);

  const toggleRunningInstagramStateDownload = () =>
    toggleAutomation("isInstagramDownload", isInstagramDownload, setIsInstagramDownload, automateInstagramClicksDownload, stopInstagramClicksDownload, setIsInstagramDownloadEnabler);

  const toggleRunningTikTokStateDownload = () =>
    toggleAutomation("isTikTokDownload", isTikTokDownload, setIsTikTokDownload, automateTikTokClicksDownload, stopTikTokClicksDownload, setIsTikTokDownloadEnabler);

  const toggleRunningYouTubeStateDownload = () =>
    toggleAutomation("isYouTubeDownload", isYouTubeDownload, setIsYouTubeDownload, automateYouTubeClicksDownload, stopYouTubeClicksDownload, setIsYouTubeDownloadEnabler);

  // --- Generalized Toggle Logic ---
  const toggleAutomation = (key, currentState, setState, startFn, stopFn, enableSetter) => {
    const newState = !currentState;
    if (newState) stopAll();
    else startAll();

    chrome.storage.local.set({ [key]: newState }, () => {
      setState(newState);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]?.id) return;
        if (newState) {
          enableSetter(true);
          chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: startFn });
        } else {
          chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: stopFn });
        }
      });
    });
  };

  // --- Stop Helper Functions ---
  function stopInstagramClicksRequest() { window._cancelRequestAutomation = true; }
  function stopInstagramClicksDownload() { window._cancelDownloadAutomation = true; }
  function stopTikTokClicksRequest() { window._cancelRequestAutomation = true; }
  function stopTikTokClicksDownload() { window._cancelDownloadAutomation = true; }
  function stopYouTubeClicksRequest() { window._cancelRequestAutomation = true; }
  function stopYouTubeClicksDownload() { window._cancelDownloadAutomation = true; }

  // --- Render ---
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow p-4">
          <h1 className="text-xl font-semibold text-gray-800">Know Your Data</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-12">
          {/* Instagram Section */}
          <Section title="Instagram">
            <p className="text-gray-700 mb-4">
              Make sure you are logged in to your Instagram account and currently on{" "}
              <a
                href={platformUrls.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                this page
              </a> to request and download data.
            </p>
            <PlatformButtons
              platforms={[
                {
                  name: "Request Data",
                  isEnabled: isInstagramRequestEnabler,
                  isRunning: isInstagramRequest,
                  onClick: toggleRunningInstagramStateRequest,
                  goTo: platformUrls.instagram,
                },
                {
                  name: "Download Data",
                  isEnabled: isInstagramDownloadEnabler,
                  isRunning: isInstagramDownload,
                  onClick: toggleRunningInstagramStateDownload,
                  goTo: platformUrls.instagram,
                },
                {
                  name: "View Dashboard",
                  isEnabled: true,
                  isRunning: false,
                  onClick: handleUploadButtonClickInstagram,
                },
              ]}
            />
          </Section>

          {/* TikTok Section */}
          <Section title="TikTok">
            <p className="text-gray-700 mb-4">
              Make sure you are logged in to your TikTok account and currently on{" "}
              <a
                href={platformUrls.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                this page
              </a> to request and download data.
            </p>
            <PlatformButtons
              platforms={[
                {
                  name: "Request Data",
                  isEnabled: isTikTokRequestEnabler,
                  isRunning: isTikTokRequest,
                  onClick: toggleRunningTikTokStateRequest,
                  goTo: platformUrls.tiktok,
                },
                {
                  name: "Download Data",
                  isEnabled: isTikTokDownloadEnabler,
                  isRunning: isTikTokDownload,
                  onClick: toggleRunningTikTokStateDownload,
                  goTo: platformUrls.tiktok,
                },
                {
                  name: "View Dashboard",
                  isEnabled: true,
                  isRunning: false,
                  onClick: handleUploadButtonClickTikTok,
                },
              ]}
            />
          </Section>

          {/* YouTube Section */}
          <Section title="YouTube">
            <p className="text-gray-700 mb-4">
              Make sure you are logged in to your YouTube account and currently on{" "}
              <a
                href={platformUrls.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                this page
              </a> to request and download data.
            </p>
            <PlatformButtons
              platforms={[
                {
                  name: "Request Data",
                  isEnabled: isYouTubeRequestEnabler,
                  isRunning: isYouTubeRequest,
                  onClick: toggleRunningYouTubeStateRequest,
                  goTo: platformUrls.youtube,
                },
                {
                  name: "Download Data",
                  isEnabled: isYouTubeDownloadEnabler,
                  isRunning: isYouTubeDownload,
                  onClick: toggleRunningYouTubeStateDownload,
                  goTo: platformUrls.youtube,
                },
                {
                  name: "View Dashboard",
                  isEnabled: true,
                  isRunning: false,
                  onClick: handleUploadButtonClickYouTube,
                },
              ]}
            />
          </Section>
        </main>
      </div>
    </div>
  );
}

const Section = ({ title, children }) => (
  <section>
    <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
    {children}
  </section>
);

const PlatformButtons = ({ platforms }) => (
  <div className="flex flex-wrap gap-4">
    {platforms.map(({ name, isEnabled, isRunning, onClick }) => (
      <button
        key={name}
        onClick={onClick}
        disabled={!isEnabled}
        className={`px-6 py-2 rounded-lg text-base font-medium shadow transition-colors
          ${isEnabled ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"}
        `}
      >
        {isRunning ? "Stop" : name}
      </button>
    ))}
  </div>
);

async function automateInstagramClicksRequest() {
  chrome.storage.local.get("isInstagramRequest", async function (result) { 

    if (!result.isInstagramRequest) return;

      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      function clickElement(xpath) {
        try {
          const result = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          );
          const element = result.singleNodeValue;

          if (element) {
            element.click();
            return true; // Successfully clicked the element
          } else {
            return false; // Element not found
          }
        } catch (error) {

          return false; // An error occurred during the process
        }
      }

      // Step 1: Click "Download or transfer"
      clickElement('//*[@role="button" and contains(., "Create export")]');
      await sleep(5000);

      // Step 2: Select manually an account
      var flag1 = clickElement('//*[@role="button" and contains(., "All available information")]');
      if (flag1==false){
          alert("Please choose an account to continue. Thanks!");
          await sleep(10000);

          // // // Step 3 : Select the Next if it appears
          // // const elements = document.querySelectorAll("div span");
          // // for (const el of elements) {
          // //   if (el.textContent.trim() === "Next") {
          // //     el.click();
          // //     break;
          // //   }
          // // }
          // // await sleep(5000);

          // // // Step 4: Click "All available information"
          // clickElement('//*[@role="button" and contains(., "All available information")]');
          // await sleep(5000);

      }
    
      // // Step 5: Click "Download to device"
      await sleep(5000);
      clickElement('//*[@role="button" and contains(., "Export to device")]');

      // // Step 6: Pick delivery method
      var flag = clickElement('//*[@role="button" and contains(., "delivery method")]');
      if (flag==true) {
          alert("Please enter an email address. Thanks!");
          // Step 7: Enter mail address
          await sleep(20000);
          // Step 8: Click Save
          clickElement('//*[@role="button" and contains(., "Save")]');
          await sleep(5000);
      }
      else{
          await sleep(5000);
      }

      // // Step 9: Change Format → Click "Format"
      clickElement('//*[@role="button" and contains(., "Format")]');
      await sleep(5000);

      // // Step 10: Select "JSON"
      clickElement("//input[@type='radio' and @value='JSON']");
      await sleep(5000);

      // // Step 11: Click Save
      clickElement('//*[@role="button" and contains(., "Save")]');
      await sleep(5000);

      // // Step 12: Change Date Range
      clickElement('//*[@role="button" and contains(., "Date range")]');
      await sleep(5000);

      // // Step 13: Choose the time range
       clickElement("//input[@type='radio' and @value='LAST_YEAR']");
      await sleep(5000);

      // // Step 14: Click Save
      clickElement('//*[@role="button" and contains(., "Save")]');
      await sleep(5000);

      // // Step 15: Click "start export"
      clickElement('//*[@role="button" and contains(., "Start export")]');
      await sleep(5000);

  });
}

async function automateInstagramClicksDownload() {
  chrome.storage.local.get("isInstagramDownload", async function (result) {

    if (!result.isInstagramDownload) return;

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      function clickElement(xpath) {
        try {
          const result = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          );
          
          const element = result.singleNodeValue;

          if (element) {
            element.click();
            return true; // Successfully clicked the element
          } else {
            return false; // Element not found
          }
        } catch (error) {
          return false; // An error occurred during the process
        }
      }

      // Step 1: Click "Download or transfer"
      clickElement('//div[@role="button"]//span[text()="Download"]');
      await sleep(5000);

      clickElement('//div[@role="button"]//span[text()="Download"]');
      await sleep(5000);
      
      alert("Please enter the Password. Thanks!");


  });
}

async function automateTikTokClicksRequest() {
  chrome.storage.local.get("isTikTokRequest", async function (result) {

  if (!result.isTikTokRequest) return;

  function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }

  try {

    // Wait for the page to load (adjust time as needed)
    await sleep(5000);

    // Find the iframe (using a more robust selector)
    const iframe = document.getElementsByTagName("iframe")[0];  
    if (!iframe) {
      alert("Could not find the download iframe.  The TikTok page may have changed. Please update the extension.");
      return; // Stop execution
    }

    // Access the iframe's content
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

    // Attempt to find and click the JSON radio button within the iframe (Robust Selector)
    const jsonRadioButton = iframeDocument.querySelector('input[type="radio"][value="json"]');  
    if (!jsonRadioButton) {
      alert("Could not find the JSON radio button. The TikTok page may have changed. Please update the extension.");
      return; 
    }
    jsonRadioButton.click();

    // Wait a bit
    await sleep(5000);

    const SelectallButton = Array.from(iframeDocument.querySelectorAll(".TUXButton-label")).find(
      (button) => button.textContent.trim() === "Select all"
    );
    if (!SelectallButton) {
      alert("Could not find the 'Select all' button. The TikTok page may have changed. Please update the extension.");
      return; // Stop execution
    }
    SelectallButton.click();

    // Wait a bit
    await sleep(5000);

    // Find and click the "Request data" button within the iframe (Robust Selector)
    const requestDataButton = Array.from(iframeDocument.querySelectorAll(".TUXButton-label")).find(
      (button) => button.textContent.trim() === "Request data"
    );
    if (!requestDataButton) {
      alert("Could not find the 'Request data' button. The TikTok page may have changed. Please update the extension.");
      return; // Stop execution
    }
    requestDataButton.click();

  } catch (error) {
    alert(`An error occurred during TikTok data request: ${error.message}. Please try again later.`);
  }

  });
}

async function automateTikTokClicksDownload() {
  chrome.storage.local.get("isTikTokDownload", async function (result) {


  if (!result.isTikTokDownload) return;

  function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }

  try {

    // Wait for the page to load (adjust time as needed)
    await sleep(5000);

    // Find the iframe (using a more robust selector)
    const iframe = document.getElementsByTagName("iframe")[0];  
    if (!iframe) {
      alert("Could not find the download iframe.  The TikTok page may have changed. Please update the extension.");
      return; // Stop execution
    }

    // Access the iframe's content
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
 
    // Shift to the Download data page
   const downloadDataButton = Array.from(iframeDocument.querySelectorAll("button")).find(
      (button) => button.textContent.trim().toLowerCase() === "download data"
    );

    if (!downloadDataButton) {
      alert("Could not find the 'Download data' button. The TikTok page may have changed. Please update the extension.");
      return;
    }

    downloadDataButton.click();

    // Wait a bit
    await sleep(5000);

    // Find and click the "Download" button within the iframe (Robust Selector)
    const DownloadButton = Array.from(iframeDocument.querySelectorAll(".TUXButton-label")).find(
      (button) => button.textContent.trim() === "Download"
    );
    if (!DownloadButton) {
      alert("Could not find the 'Download' button. The TikTok page may have changed or your data is not ready. Please update the extension.");
      return; // Stop execution
    }

    DownloadButton.click();

  } catch (error) {

    alert(`An error occurred during TikTok data download: ${error.message}. Please try again later.`);
  }

  });
}

async function automateYouTubeClicksRequest() {
      chrome.storage.local.get("isYouTubeRequest", async function (result) {

      if (!result.isYouTubeRequest) return;

      function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
      }

      function clickElement(xpath) {
        try {
            const result = document.evaluate(
                xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              );
              const element = result.singleNodeValue;

              if (element) {
                element.click();
                return true; // Successfully clicked the element
              } else {
                  alert("The YouTube page may have changed. Please update the extension.");
                  return false; // An error occurred during the process
              }
            } catch (error) {
              alert("The YouTube page may have changed. Please update the extension.");
              return false; // An error occurred during the process
            }
          }

      try {

        // Click deselect all
        clickElement("//button[@aria-label='Deselect all']");
        await sleep(5000);

        // Select youtube
        clickElement("//input[@type='checkbox' and @name='YouTube and YouTube Music']")
        await sleep(5000);

        // Select multiple formats
        clickElement("//button[@aria-label='Multiple formats for YouTube and YouTube Music']")
        await sleep(5000);

        // Select Json
        clickElement("//li[@role='option']//span[contains(text(), 'JSON')]//ancestor::li");
        await sleep(5000);

        // Select Ok 
        const okButton = Array.from(document.querySelectorAll("div[role='button']")).find(
          (button) => button.textContent.trim().toLowerCase() === "ok"
        );

        if (!okButton) {
          alert("Could not find the 'OK' button. The YouTube page may have changed. Please update the extension.");
          return;
        }

        okButton.click();
        await sleep(5000);
        
        // Click to uncheck videos
        clickElement("//button[@aria-label='All YouTube data included']")
        await sleep(5000);

        clickElement("//input[@type='checkbox' and @data-indeterminate='false' and @value='VIDEOS']")
        await sleep(5000);

        // Select Ok 
        const okButton_1 = Array.from(document.querySelectorAll("div[role='button']")).find(
          (button) => button.textContent.trim().toLowerCase() === "ok"
        );

        if (!okButton_1) {
          alert("Could not find the 'OK' button. The YouTube page may have changed. Please update the extension.");
          return;
        }

        okButton_1.click();
        await sleep(5000);
        
        
        // Select Next Step
        clickElement("//button[@aria-label='Next step']")
        await sleep(5000);

        // // Select Create EXPORT
        clickElement("//button//*[contains(text(),'Create export')]")
        await sleep(5000);

      } catch (error) {
        alert(`An error occurred during YouTube data request: ${error.message}. Please try again later.`);
      }

      });
}

async function automateYouTubeClicksDownload() {
      chrome.storage.local.get("isYouTubeDownload", async function (result) {

      if (!result.isYouTubeDownload) return;

      function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
      }

      function clickElement(xpath) {
        try {
            const result = document.evaluate(
                xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              );
              const element = result.singleNodeValue;

              if (element) {
                element.click();
                return true; // Successfully clicked the element
              } else {
                  
                  alert("The YouTube page may have changed. Please update the extension.");
                  return false; // An error occurred during the process
              }
            } catch (error) {
              
              alert("The YouTube page may have changed. Please update the extension.");
              return false; // An error occurred during the process
            }
          }

      try {

        // Click on download button
        clickElement("//a[contains(@aria-label, 'Download')]");
        await sleep(5000);


      } catch (error) {

        alert(`An error occurred during YouTube data request: ${error.message}. Please try again later.`);
      }

      });
}


export default App;
