"use client";
import Navbar from "@/components/navbar";
import { useEffect, useState, useMemo} from 'react';
import { useSearchParams } from 'next/navigation'
import { MotionCanvasPlayerProps } from "@revideo/player";
import { ComponentProps } from "react";
import "../../../../public/revideo-project-styles.css";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'revideo-player': MotionCanvasPlayerProps & ComponentProps<'div'>;
    }
  }
}  

export default function Edit({params}: {params: {id: string}}) {
    const [metadata, setMetadata] = useState<any>(null);
    const [fontColor, setFontColor] = useState('red');
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const id = params.id;    

    useEffect(() => {
      import("@revideo/player");
    }, []);

    useEffect(() => {
      if (metadata && fontColor) {
        setMetadata({
          ...metadata,
          fontColor: fontColor,
        });
      }
    }, [fontColor]); 

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`https://revideo-example-assets.s3.amazonaws.com/${id}/metadata.json`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setMetadata(data);
                } catch (error) {
                    console.error("Fetching metadata failed:", error);
                }
            };

            fetchData();
        }
    }, [id]);

    // This function ensures that we have all assets downloaded before showing the player
    useEffect(() => {
      const preloadLinks: HTMLLinkElement[] = [];
      let loadedImagesCount = 0;
      const totalImages = metadata?.images.length;  
    
      if (metadata && metadata.images) {
        metadata.images.forEach((imageUrl: string) => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = imageUrl;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
          preloadLinks.push(link);
          const img = new Image();
          img.onload = () => {
            loadedImagesCount++;
            if (loadedImagesCount === totalImages) {
              setAssetsLoaded(true);
            }
          };
          img.src = imageUrl;
        });
          }
      return () => {
        preloadLinks.forEach(link => {
          document.head.removeChild(link);
        });
      };
    }, [metadata]);

    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto mt-8 gap-32 flex">
          <div className="w-1/2">
            <h2 className="text-3xl font-semibold leading-7 text-gray-900">
              Edit your video
            </h2>
            <form className="flex flex-col space-y-4 mt-10">
              {/* Font Color Selector */}
              <div>
                <label
                  htmlFor="fontColor"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Font Color
                </label>
                <select
                  id="fontColor"
                  name="fontColor"
                  className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                >
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                  <option value="white">White</option>
                </select>
              </div>
              {/* Add more form elements as needed */}
            </form>
          </div>

        <div className="w-[35%]">
          { metadata && assetsLoaded ? ( // Check if metadata is not null
          <revideo-player 
                src="/revideo-project.js" 
                variables={JSON.stringify(metadata)}          
          />
          ) : <div>Loading player...</div>

    }
    </div>
        </div>
      </>
    );
  }