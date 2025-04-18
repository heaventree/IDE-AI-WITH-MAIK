import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Icons
import { ArrowRight, Link as LinkIcon } from "lucide-react";

interface FrameworkIconProps {
  color: string;
  children: React.ReactNode;
}

const FrameworkIcon: React.FC<FrameworkIconProps> = ({ color, children }) => (
  <div className={`w-10 h-10 flex items-center justify-center rounded-md mb-1.5 ${color}`}>
    {children}
  </div>
);

const EntryPage: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [location, setLocation] = useLocation();

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Prompt submitted:", prompt);
  };

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      {/* Header - logo and exit button */}
      <header className="w-full flex justify-between items-center px-6 py-3">
        <div className="text-xl font-bold ml-1">bolt</div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setLocation("/")} 
            variant="ghost" 
            size="sm" 
            className="px-2 text-sm"
          >
            Return to IDE
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </Button>
        </div>
      </header>

      {/* Top notification banner */}
      <div className="w-full py-2 px-4 flex justify-center items-center">
        <div className="bg-gray-100 px-4 py-1.5 rounded-full flex items-center">
          <div className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
            New
          </div>
          <span className="text-sm">Stripe Payments support</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center">
          What do you want to build?
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Prompt, run, edit, and deploy full-stack <span className="text-gray-800 font-medium">web</span> and <span className="text-gray-800 font-medium">mobile</span> apps.
        </p>

        {/* Token count */}
        <div className="text-sm text-gray-600 mb-4 flex items-center">
          <span>100K daily tokens remaining</span>
          <Button variant="link" size="sm" className="ml-1 text-indigo-600 text-xs px-0 h-5">
            Subscribe to Pro for more usage
          </Button>
        </div>

        {/* Prompt input */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-8">
          <div className="relative">
            <Input
              value={prompt}
              onChange={handlePromptChange}
              placeholder="How can Bolt help you today?"
              className="pr-16 py-6 text-md bg-white border-gray-300 rounded-lg focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button 
                type="button" 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-gray-400 hover:text-gray-600"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button
                type="submit"
                size="icon"
                className="h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>

        {/* Quick start options */}
        <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-2xl">
          <Button
            variant="outline"
            className="justify-start h-auto py-3 px-4 bg-white border-gray-200 hover:bg-gray-50 shadow-sm text-gray-800"
          >
            <div className="w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-600 rounded mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <span>Import from Figma</span>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-3 px-4 bg-white border-gray-200 hover:bg-gray-50 shadow-sm text-gray-800"
          >
            <div className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <span>Build a mobile app with Expo</span>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-3 px-4 bg-white border-gray-200 hover:bg-gray-50 shadow-sm text-gray-800"
          >
            <div className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <span>Start a blog with Astro</span>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-3 px-4 bg-white border-gray-200 hover:bg-gray-50 shadow-sm text-gray-800"
          >
            <div className="w-6 h-6 flex items-center justify-center bg-amber-100 text-amber-600 rounded mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <span>Draft a presentation with Slides</span>
          </Button>
        </div>

        {/* Frameworks */}
        <p className="text-gray-600 text-sm mb-4">or start a blank app with your favorite stack</p>
        <div className="grid grid-cols-6 gap-x-6 gap-y-6 max-w-lg mb-8">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center mb-1.5">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-400">
                <g fill="#61DAFB">
                  <circle cx="12" cy="12" r="2.139"/>
                  <path d="M11.985 0c-1.304 0-2.442.147-3.364.356-2.863.65-3.329 2.011-3.329 3.643v2.63H12v.703H3.363c-1.62 0-3.039.969-3.482 2.815-.512 2.118-.534 3.438 0 5.65.397 1.645 1.343 2.814 2.962 2.814h1.917V16.12c0-1.868 1.62-3.507 3.329-3.507h5.328c1.481 0 2.639-1.218 2.639-2.7V4c0-1.44-1.217-2.524-2.639-2.765C12.951.881 13.289 0 11.985 0zM8.843 1.428c.546 0 .992.45.992.999a.996.996 0 01-.992.998.996.996 0 01-.991-.998c0-.55.445-.999.991-.999z"/>
                  <path d="M12.015 24c1.304 0 2.442-.147 3.364-.356 2.863-.65 3.329-2.011 3.329-3.643v-2.63H12v-.703h8.636c1.62 0 3.039-.969 3.482-2.814.513-2.119.534-3.439 0-5.65-.397-1.646-1.343-2.815-2.962-2.815h-1.917v2.492c0 1.868-1.62 3.507-3.329 3.507H10.57c-1.481 0-2.639 1.218-2.639 2.7v5.07c0 1.44 1.217 2.525 2.639 2.766 1.466.251 1.129 1.131 2.432 1.131zm3.141-1.427a.996.996 0 01-.991-.998c0-.55.445-.999.991-.999.546 0 .992.45.992.999a.996.996 0 01-.992.998z"/>
                </g>
              </svg>
            </div>
            <span className="text-xs">React</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center mb-1.5">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <path fill="#4FC08D" d="M24 1.61h-9.94L12 5.16 9.94 1.61H0l12 20.78zM12 14.08L5.16 2.23h4.43L12 6.41l2.41-4.18h4.43z"/>
              </svg>
            </div>
            <span className="text-xs">Vue</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center mb-1.5">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <path fill="black" d="M11.572 0c-.176 0-.31.001-.358.007-.062.008-.144.024-.25.05-.143.036-.302.099-.477.201a2.314 2.314 0 00-.679.468c-.088.098-.279.32-.574.675l-.86.104-.913 1.049-.74.86C4.45 6.987 2.103 9.92 2.103 9.92c4.163-2.4 7.398-3.95 9.698-4.65.261-.079.533-.15.798-.214.18-.044.35-.082.525-.126.025-.006.05-.012.075-.017.154-.036.303-.069.446-.099.05-.012.105-.022.155-.032a73.76 73.76 0 01.935-.176c.036-.006.073-.012.108-.018q.462-.075.89-.132c.125-.018.25-.034.371-.05.216-.027.427-.05.631-.069.116-.01.232-.02.346-.027.338-.025.659-.044.962-.054.161-.005.32-.008.476-.008.337 0 .659.011.962.034.108.009.216.02.322.031.229.024.451.055.664.09.257.043.51.096.748.158.067.016.129.033.192.051.151.043.301.088.447.136.186.062.367.13.541.204.056.023.113.047.167.071.03.013.128.057.202.092.325.154.606.332.86.535.076.06.228.193.275.235a3.62 3.62 0 01.305.33c.036.044.055.068.08.102.103.138.192.282.262.428.055.114.1.228.135.341.02.058.048.153.05.163.04.145.093.404.093.563 0 .45-.158.898-.483 1.35-.355.493-.881.932-1.53 1.252-.652.322-1.445.5-2.353.5-.117 0-.237-.003-.356-.009a4.995 4.995 0 01-1.143-.19 4.339 4.339 0 01-.757-.271 3.975 3.975 0 01-.665-.37 4.184 4.184 0 01-.834-.682l-.102-.104c.045.04.09.078.136.115.25.191.518.35.806.476.09.04.183.075.277.108.118.04.238.077.362.107.45.111.928.168 1.41.168.145 0 .291-.007.432-.021a4.96 4.96 0 00.57-.08 4.754 4.754 0 00.52-.138c.695-.226 1.3-.615 1.756-1.098.154-.16.295-.332.417-.513a2.31 2.31 0 00.204-.365c.149-.316.222-.633.221-.941 0-.024 0-.05-.002-.076a1.497 1.497 0 00-.026-.234 1.383 1.383 0 00-.09-.318 1.437 1.437 0 00-.309-.521 1.651 1.651 0 00-.279-.252 2.305 2.305 0 00-.484-.285 2.434 2.434 0 00-.493-.158c-.037-.007-.146-.023-.18-.027-.064-.008-.128-.016-.193-.022-.63-.065-1.333-.08-2.117-.044a13.19 13.19 0 00-1.407.156c-.267.043-.526.09-.776.142-.512.107-1.012.232-1.5.375Z"/>
              </svg>
            </div>
            <span className="text-xs">Next.js</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center mb-1.5">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <path fill="#00DC82" d="M17.304 7.804c-.391-.24-1.606-.24-1.606-.24s-3.114.72-4.432 2.1c-.72.72-.96 1.908-.96 1.908s-.354-.720.366-1.695c.638-.862 1.421-1.38 1.421-1.38l-.355-.36s-.946.492-1.422 1.202c-.5.74-.757 1.245-.757 1.245s-.076-.61.038-1.038c0 0 .058-.254.58-.973.115-.16.173-.326.173-.326l-.462-.034s-.253.559-.371.818c-.218.49-.284.859-.324 1.145-.045.326-.54.641-.54.641s-.115-.573.058-1.57c.151-.87.25-1.249.25-1.249l-.485.187s-.196.82-.29 1.382c-.1.595-.148 1.3-.148 1.3s-.115-.582-.034-1.077c.072-.4.173-.84.173-.84l-.462.058s-.126.516-.181.84c-.078.452-.126.979-.126.979s-.144-.499-.144-.903c0-.356.068-.749.068-.749l-.38-.02s-.08.468-.107.767c-.029.316-.03.721-.03.721l-2.423.153 3.671 3.701S7.926 13.97 7.4 12.86c-.218-.452-.315-.701-.315-.701l.012.693s-.213-.467-.292-.701c-.076-.233-.16-.63-.16-.63s.097.763.114.976a32.7 32.7 0 01.058 1.335l-1.2-1.201.917.033a.34.34 0 00-.05-.068c-.105-.151-.396-.43-.396-.43s.238.523.278.673c.035.133.07.27.07.27l-.382-.368s.043.296.043.475c0 .162-.19.38-.19.38s-.1-.222-.191-.422c-.102-.226-.162-.329-.162-.329l.1.428s-.08-.14-.129-.21c-.02-.026-.028-.035-.035-.046-.11.007-.217.013-.326.02-.334.016-.64.02-.64.02s.432-.26.744-.389c.334-.137.769-.27.769-.27s-.868-.114-1.416.048c-.195.058-.4.14-.578.227.074-.096.146-.186.217-.268a3.92 3.92 0 01.992-.777c.464-.226.703-.258.703-.258s-.563-.063-1.07.185a2.423 2.423 0 00-.858.614c.057-.177.128-.35.211-.516a3.196 3.196 0 011.328-1.419c.05-.027.098-.049.098-.049s-.334-.082-.754.09a2.303 2.303 0 00-1.187.887c.084-.23.176-.444.274-.636.126-.25.264-.474.264-.474s-.432.023-.72.335c-.289.313-.45.695-.45.695-1.572-.362-3.153.52-3.153.52s2.948 1.961 4.952 2.157c1.229.12 1.846-.307 1.846-.307s-.007-.032-.02-.087c-.3-1.225-2.548-1.039-3.756-1.039a3.08 3.08 0 01-.253-.01c.163.025.318.057.473.095 1.404.35 2.357 1.098 2.332 1.68-.025.58-1.03 1.13-2.33 1.23-1.302.1-2.352-.283-2.381-.99a.905.905 0 01.203-.538c-.105.03-.136.056-.136.056s-.08.205-.08.44c0 1.003 1.4 1.772 3.025 1.725 1.625-.048 2.933-.877 2.933-1.86 0-.175-.052-.35-.157-.513.173.06.29.12.29.12s.09.188.09.45c0 1.257-1.742 2.197-3.683 2.1-1.942-.098-3.354-1.083-3.354-2.354 0-.197.034-.38.102-.552-.059.012-.092.018-.092.018s-.114.237-.114.551c0 1.537 2.118 2.65 4.542 2.487 2.423-.16 4.298-1.49 4.298-3.044 0-.242-.057-.479-.16-.702 1.349-.16 2.073-1.099 2.073-1.099s-1.149.503-2.117.388c0 0 .043-.068.09-.152.396-.701 1.263-1.078 1.263-1.078s-.976.098-1.689.745c-.072.065-.132.13-.178.187.043-.083.092-.164.147-.237.476-.63 1.259-.926 1.259-.926s-.763.066-1.388.549c-.202.155-.349.314-.455.454.025-.064.051-.127.084-.19.269-.538.8-.894.8-.894s-.504.114-.86.49c-.08.083-.15.166-.211.247a3.78 3.78 0 00-.118-.295c-.346-.705-1.394-1.105-2.548-.937-1.153.17-1.885.871-1.654 1.572.117.354.396.637.773.83-.144-.044-.274-.103-.386-.173-.477-.297-.763-.755-.644-1.153.226-.75 1.358-1.203 2.518-.976 1.16.22 1.95 1.207 1.47 1.963-.253.4-.72.687-1.295.808l.016-.001c.563-.066 1.05-.275 1.38-.578a.848.848 0 00.214-.256c.055-.099.082-.202.082-.305 0-.07-.012-.14-.035-.21.72.013.144.02.144.02s.129.189.129.474c0 .285-.158.592-.43.853-.231.222-.556.407-.946.539-.027.008-.052.016-.08.025-.144.04-.292.072-.443.095-.01.001-.018.003-.027.005l.011.003c.187.035.384.054.59.054 1.577 0 2.861-1.06 2.972-2.435 2.728-1.588 4.344-3.299 4.344-3.299s-1.473 1.6-3.802 2.667c0-.08-.005-.158-.014-.236-.168-1.522-1.813-2.67-3.816-2.61l-2.212.066s3.83-.382 5.817.446a7.295 7.295 0 001.572-.5c.515-.226.96-.51 1.388-.818-.004.006-.01.011-.013.017-.1.16-.23.318-.39.47.087-.068.172-.138.255-.208.33-.289.604-.626.604-.626s-.198.176-.342.27c.095-.101.187-.204.276-.31.354-.42.65-.916.65-.916s-.166.214-.288.345c.105-.16.204-.328.294-.5.294-.56.44-1.19.44-1.19s-.125.238-.211.36c.063-.16.12-.328.169-.5.161-.58.23-1.23.23-1.23s-.097.279-.181.468c.039-.162.069-.329.09-.5.085-.623.042-1.3.042-1.3s-.033.27-.07.454a5.456 5.456 0 00-.007-.702c.042-.616.174-1.269.174-1.269s-.113.205-.198.425c.05-.18.102-.362.16-.542.135-.426.306-.881.306-.881s-.09.109-.17.251c.048-.118.1-.235.154-.352a5.69 5.69 0 01.544-.885s-2.549-1.439-5.44-.42c-.245.086-.458.171-.668.257-1.098.452-1.96 1.064-2.43 1.895-.277.489-.418 1.028-.353 1.564a2.19 2.19 0 00.026.16c.078.387.251.781.51 1.144.39.56-.289-.274-.44-.798-.13-.353-.194-.717-.178-1.081 0-.009 0-.017 0-.026a1.941 1.941 0 01.104-.6c.064-.187.162-.371.287-.553.336-.486.88-.941 1.582-1.31.195-.101.388-.193.554-.267a6.377 6.377 0 00-.832-2.64 6.41 6.41 0 00-3.752-3.089c-3.607-1.2-7.189.846-7.966 4.66-.777 3.814 1.355 7.674 4.765 8.618 3.411.946 7.153-.747 8.298-3.786.57-1.519.637-3.068.27-4.402a4.427 4.427 0 00-.147-.444 4.806 4.806 0 00-.657-1.168 4.08 4.08 0 00-.467-.538c.001.002.004.002.006.004.195.126.484.359.726.594.312.303.618.687.618.687s-.034-.158-.09-.335c.125.17.241.346.348.529.147.25.275.53.275.53s-.03-.169-.078-.37c.083.201.153.41.21.626.085.31.13.626.137.938.1.042.19.084.25.126-.124-.552-.35-1.102-.667-1.623-.289-.476-.604-.87-.604-.87s.109.252.2.51c-.067-.14-.138-.279-.213-.415-.262-.473-.55-.892-.55-.892s.097.235.19.508c-.054-.12-.113-.237-.173-.353-.193-.372-.403-.67-.403-.67s.084.194.169.433c-.088-.2-.183-.395-.285-.584a7.62 7.62 0 00-.404-.671s.097.202.198.452c-.072-.152-.149-.3-.228-.442-.229-.41-.453-.726-.453-.726s.118.278.228.592c-.074-.162-.151-.32-.233-.473-.2-.37-.4-.697-.4-.697l.254.61a7.783 7.783 0 00-.468-.793s.134.3.26.626c-.094-.202-.195-.395-.305-.58-.25-.419-.503-.74-.503-.74s.165.343.31.69c-.085-.17-.17-.331-.26-.48-.186-.304-.37-.551-.37-.551s.135.273.259.563a8.9 8.9 0 00-.26-.431c-.203-.303-.404-.547-.404-.547s.135.26.261.536c-.082-.152-.168-.298-.26-.434a6.96 6.96 0 00-.353-.487s.134.229.244.452c-.077-.144-.159-.281-.246-.412-.185-.279-.37-.505-.37-.505s.1.187.19.382a9.443 9.443 0 00-.306-.47c-.185-.262-.37-.472-.37-.472s.11.194.22.405c-.154-.297-.447-.729-.447-.729.143.22.28.446.411.677.204.36.397.743.566 1.143.169.4.335.845.48 1.326.143.481.243.967.319 1.453.75.485.125.97.15 1.452.025.483.025.966 0 1.446-.027.476-.074.951-.14 1.424-.068.473-.155.943-.263 1.41-.109.465-.24.929-.397 1.389.6-.3 1.7-1.1 2.358-1.82a5.64 5.64 0 001.122-1.926c.1-.26.171-.541.244-.83a9.2 9.2 0 00.15-.814c.024-.235.034-.458.05-.67"/>
              </svg>
            </div>
            <span className="text-xs">Nuxt</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center mb-1.5">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <path d="M9.931 12.645h4.138l-2.07-3.582z" fill="#DD0031"/>
                <path d="M12 3.295L2.427 18.856l1.40.786 3.105-3.002h10.138l3.105 3.002 1.398-.786L12 3.295zm0 2.44l5.444 9.44h-3.374l-1.035-1.793h-2.07L9.93 14.982H6.557l5.444-9.44z" fill="#DD0031"/>
              </svg>
            </div>
            <span className="text-xs">Angular</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center mb-1.5">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <path fill="#FF3E00" d="M10 5.87c-2.994 1.166-4.985 3.11-4.985 5.126a3.96 3.96 0 0 0 1.948 3.287c.34.222.781.348 1.292.348 1.345 0 2.899-1.02 4.103-2.623l-.494-.891c-1.276 1.544-2.975 2.338-3.609 1.744-.635-.594-.03-2.366 1.343-3.971l-.598-.874Zm7.304 3.546 2.367.194-.172 2.37-2.368-.195.173-2.369Zm-1.304-2.915c-.86-.338-1.857-.424-2.81-.181-.144.035-.29.085-.436.144l.22.951c.18-.073.36-.135.538-.18.607-.154 1.235-.092 1.818.128l.67-.862Zm.485.865-.671.862c.583.221 1.105.576 1.52.998.414.421.732.925.926 1.56l.95-.222c-.256-.847-.677-1.51-1.214-2.03-.536-.522-1.1-.932-1.511-1.168Zm-2.975-.684-2.993 4.287 2.993 4.288 5.986-4.288-5.986-4.287Zm-4.687 3.027-.214 2.37-2.368.193.214-2.369 2.368-.194Zm7.39-4.64.671.864c.41-.234.818-.38 1.21-.394.392-.011.665.111.759.325.095.213-.05.595-.3 1.063l.893.488c.344-.64.502-1.292.32-1.694-.181-.403-.664-.6-1.216-.58-.552.019-1.143.234-1.654.546l-.683-.618Zm-3.721 12.597-.683-.618c-.511.312-1.102.527-1.654.546-.552.02-1.035-.177-1.216-.58-.182-.402-.024-1.054.32-1.694l.893.488c-.25.468-.395.85-.3 1.063.94.214.367.336.759.325.392-.014.8-.16 1.21-.394l.671.864Z"/>
              </svg>
            </div>
            <span className="text-xs">Svelte</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center mb-1.5">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <path fill="#000000" d="M24 18.588a1.529 1.529 0 01-1.429 1.428h-21.142a1.529 1.529 0 01-1.429-1.428v-13.176a1.529 1.529 0 011.429-1.428h21.142a1.529 1.529 0 011.429 1.428v13.176zm-8.591-13.789c-.427 0-.8.227-.905.547l-4.743 16.352a.592.592 0 00.41.739.5.5 0 00.167.027.617.617 0 00.581-.412l4.742-16.339a.57.57 0 00-.42-.72.536.536 0 00-.168-.027l.314.035-.157-.035h-.178l.178.035-.178-.035h.178-.178.178l-.178-.035zm-12.102 7.15c-.405 0-.764.192-.908.473l-1.678 2.982a.593.593 0 000 .557l1.678 2.983c.144.289.516.48.908.48h11.158c.392 0 .764-.191.908-.48l1.679-2.983a.594.594 0 000-.557l-1.679-2.982c-.144-.281-.516-.473-.908-.473h-11.158zm11.158 6.678h-11.158l-1.679-2.983 1.679-2.982h11.158l1.679 2.982-1.679 2.983z"/>
              </svg>
            </div>
            <span className="text-xs">Express</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center mb-1.5">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <path fill="#000000" d="M12 0C8.29 0 5.68 2.41 5.68 5.88c0 2.38 1.29 4.31 3.2 5.33-.09 1.5-.56 3.55-3.13 5.24 3.83.3 6.5-1.56 7.14-4.04 3.7-.16 6.43-2.47 6.43-6.53C19.32 2.41 16.71 0 12 0Z"/>
              </svg>
            </div>
            <span className="text-xs">Remix</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center mb-1.5">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <path fill="#3178C6" d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
              </svg>
            </div>
            <span className="text-xs">TypeScript</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center mb-1.5">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <path fill="#764ABC" d="M16.634 16.504c.87-.075 1.543-.84 1.5-1.754-.047-.914-.796-1.648-1.709-1.648h-.061a1.71 1.71 0 0 0-1.648 1.769c.03.479.226.869.494 1.153-1.048 2.038-2.621 3.536-5.005 4.795-1.603.838-3.296 1.154-4.944.93-1.378-.195-2.456-.81-3.116-1.799-.988-1.499-1.078-3.116-.255-4.734.6-1.17 1.499-2.023 2.099-2.443a9.96 9.96 0 0 1-.27-1.394c-2.998 2.134-4.271 5.431-2.862 8.277 1.019 2.053 3.057 3.297 5.599 3.297.599 0 1.198-.044 1.797-.194 3.751-.494 6.573-2.443 8.161-5.178Z"/>
                <path fill="#764ABC" d="M21.753 12.634c-1.648-1.923-4.075-2.977-6.838-2.977h-.36c-.3-.6-.899-1.02-1.648-1.02h-.06c-.93 0-1.649.75-1.649 1.65 0 .914.72 1.648 1.65 1.648h.06c.749 0 1.379-.45 1.648-1.079h.42c1.648 0 3.207.524 4.615 1.529 1.078.75 1.838 1.739 2.267 2.908.36.899.33 1.768-.09 2.518-.599 1.169-1.618 1.798-2.986 1.798-.9 0-1.768-.224-2.227-.494-.3.27-.839.599-1.229.839 1.02.465 2.038.704 3.027.704 2.243 0 3.897-1.199 4.526-2.368.66-1.289.629-3.537-1.078-5.656ZM10.477 16.204c.045.9.72 1.648 1.65 1.648h.06c.93 0 1.649-.749 1.649-1.648 0-.9-.72-1.648-1.65-1.648h-.059c-.044 0-.104 0-.15.014-.824-1.394-1.169-2.897-1.049-4.486.075-1.199.524-2.218 1.318-3.056.656-.675 1.978-1.05 2.877-.914.75.104 1.349.42 1.798.945.254.3.494.75.644 1.199.36-.165.96-.406 1.349-.539-.3-.944-.748-1.769-1.439-2.398-.9-.825-2.097-1.29-3.447-1.29-2.917 0-5.156 2.249-5.485 5.156-.194 1.843.269 3.657 1.319 5.066-.165.254-.3.614-.3.974Z"/>
              </svg>
            </div>
            <span className="text-xs">Redux</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center mb-1.5">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <path fill="#000000" d="M12 12a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-8zM4 8a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2H4zm0 8a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2H4z"/>
                <path fill="#000000" d="M12.5 7C12.5 5.067 10.933 3.5 9 3.5S5.5 5.067 5.5 7 7.067 10.5 9 10.5 12.5 8.933 12.5 7zm-7 0c0-1.933 1.567-3.5 3.5-3.5s3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5S5.5 8.933 5.5 7z"/>
                <path fill="#000000" d="M5.5 19c0-1.933 1.567-3.5 3.5-3.5h12a1 1 0 1 0 0-2H9c-3.037 0-5.5 2.463-5.5 5.5 0 3.036 2.463 5.5 5.5 5.5a5.5 5.5 0 0 0 5.5-5.5 1 1 0 1 0-2 0c0 1.933-1.567 3.5-3.5 3.5S5.5 20.933 5.5 19z"/>
              </svg>
            </div>
            <span className="text-xs">Flask</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center mb-1.5">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <path fill="#092E20" d="M11.146 0h5.46v17.481c-2.79.513-4.841.714-7.07.714-6.65 0-10.153-3.002-10.153-8.753 0-5.54 3.67-9.137 9.344-9.137 1.04 0 1.81.1 2.42.307V0zm0 8.846c-.65-.201-1.17-.28-1.85-.28-2.78 0-4.38 1.73-4.38 4.78 0 2.96 1.52 4.59 4.33 4.59.61 0 1.1-.05 1.9-.17V8.846zM23.894 6.045v8.813c0 3.034-.23 4.49-1.13 5.746-1.01 1.16-2.32 1.96-5.06 2.755l-5.72-2.755c2.77-.81 4.13-1.53 5-2.63.88-1.12 1.17-2.43 1.17-5.85V6.046h5.74zm-5.74 4.3V0h5.74v10.344h-5.74z"/>
              </svg>
            </div>
            <span className="text-xs">Django</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 px-6 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <span className="whitespace-nowrap">We're hiring</span>
            <span>•</span>
            <Link href="/help" className="text-gray-500 hover:text-gray-700">Help Center</Link>
            <span>•</span>
            <Link href="/pricing" className="text-gray-500 hover:text-gray-700">Pricing</Link>
            <span>•</span>
            <Link href="/terms" className="text-gray-500 hover:text-gray-700">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-700">Privacy</Link>
          </div>
          <div className="text-gray-500">
            © 2025 Bolt
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EntryPage;