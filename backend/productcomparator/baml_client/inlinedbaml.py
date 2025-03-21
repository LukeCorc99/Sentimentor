###############################################################################
#
#  Welcome to Baml! To use this generated code, please run the following:
#
#  $ pip install baml-py
#
###############################################################################

# This file was generated by BAML: please do not edit it. Instead, edit the
# BAML files and re-generate this code.
#
# ruff: noqa: E501,F401,F821
# flake8: noqa: E501,F401,F821
# pylint: disable=unused-import,line-too-long
# fmt: off

file_map = {
    
    "../c:\\Users\\Luke\\OneDrive - Atlantic TU\\Yr2Semester1\\Desktop\\OS\\Sentimentor\\backend\\productcomparator\\baml_src\\clients.baml": "// Learn more about clients at https://docs.boundaryml.com/docs/snippets/clients/overview\r\n\r\nclient<llm> CustomGPT4o {\r\n  provider openai\r\n  options {\r\n    model \"gpt-4o\"\r\n    api_key env.OPENAI_API_KEY\r\n  }\r\n}\r\n\r\nclient<llm> CustomGPT4oMini {\r\n  provider openai\r\n  retry_policy Exponential\r\n  options {\r\n    model \"gpt-4o-mini\"\r\n    api_key env.OPENAI_API_KEY\r\n  }\r\n}\r\n\r\nclient<llm> CustomSonnet {\r\n  provider anthropic\r\n  options {\r\n    model \"claude-3-5-sonnet-20241022\"\r\n    api_key env.ANTHROPIC_API_KEY\r\n  }\r\n}\r\n\r\n\r\nclient<llm> CustomHaiku {\r\n  provider anthropic\r\n  retry_policy Constant\r\n  options {\r\n    model \"claude-3-haiku-20240307\"\r\n    api_key env.ANTHROPIC_API_KEY\r\n  }\r\n}\r\n\r\n// https://docs.boundaryml.com/docs/snippets/clients/round-robin\r\nclient<llm> CustomFast {\r\n  provider round-robin\r\n  options {\r\n    // This will alternate between the two clients\r\n    strategy [CustomGPT4oMini, CustomHaiku]\r\n  }\r\n}\r\n\r\n// https://docs.boundaryml.com/docs/snippets/clients/fallback\r\nclient<llm> OpenaiFallback {\r\n  provider fallback\r\n  options {\r\n    // This will try the clients in order until one succeeds\r\n    strategy [CustomGPT4oMini, CustomGPT4oMini]\r\n  }\r\n}\r\n\r\n// https://docs.boundaryml.com/docs/snippets/clients/retry\r\nretry_policy Constant {\r\n  max_retries 3\r\n  // Strategy is optional\r\n  strategy {\r\n    type constant_delay\r\n    delay_ms 200\r\n  }\r\n}\r\n\r\nretry_policy Exponential {\r\n  max_retries 2\r\n  // Strategy is optional\r\n  strategy {\r\n    type exponential_backoff\r\n    delay_ms 300\r\n    multiplier 1.5\r\n    max_delay_ms 10000\r\n  }\r\n}",
    "../c:\\Users\\Luke\\OneDrive - Atlantic TU\\Yr2Semester1\\Desktop\\OS\\Sentimentor\\backend\\productcomparator\\baml_src\\comparison.baml": "class ProductAnalysis {\r\n  name string\r\n  summary string\r\n  price string\r\n  priceSource string\r\n  specifications string[]\r\n  valueForMoney string\r\n  soundQuality string\r\n  comfortFit string\r\n  batteryLife string\r\n  connectivity string\r\n  featuresControls string\r\n  callQuality string\r\n  brandWarranty string\r\n  userFeedback string\r\n  availability string\r\n  sentimentRating float\r\n  sentiment string\r\n}\r\n\r\nclass ProductComparison {\r\n  name1 string\r\n  name2 string\r\n  summary string\r\n  price1 string\r\n  priceSource1 string\r\n  price2 string\r\n  priceSource2 string\r\n  specifications1 string[]\r\n  specifications2 string[]\r\n  score1 string\r\n  score2 string\r\n  sentiment1 string\r\n  sentiment2 string\r\n  valueForMoneyComparison string\r\n  soundQualityComparison string\r\n  comfortFitComparison string\r\n  batteryLifeComparison string\r\n  connectivityComparison string\r\n  featuresControlsComparison string\r\n  callQualityComparison string\r\n  brandWarrantyComparison string\r\n  userFeedbackComparison string\r\n  availabilityComparison string\r\n  overallSentimentComparison string \r\n  recommendation string\r\n}\r\n\r\nfunction AnalyzeProductReview(text: string) -> ProductAnalysis {\r\n  client \"openai/gpt-4o-mini\"\r\n  prompt #\"\r\n    Analyze the following product review\r\n    {{ text }}\r\n\r\n    Do not specifically mention the review, just provide the information as if you are summarizing the product.\r\n\r\n    Based on the review, extract the following data:\r\n    - The product name (make sure it is concise and avoids unnecessary words)\r\n    - A summary of the product between 30-40 words\r\n    - Price (Display in euros, in the format €x.xx)\r\n    - Specific source of product price (Must be from a retailer, if not, an official website. \"Product listing\", \"announcement\", etc. are not valid sources)\r\n    - Product specifications in a structured format\r\n\r\n    Provide very brief analysis under the following headings:\r\n    - Value for Money (not the price itself, but the value the product offers for the price)\r\n    - Sound Quality\r\n    - Comfort & Fit\r\n    - Battery Life & Charging\r\n    - Connectivity & Compatibility\r\n    - Features & Controls\r\n    - Call Quality & Microphone Performance\r\n    - Brand & Warranty\r\n    - Reviews & User Feedback\r\n    - Availability & Local Factors\r\n\r\n    - Based on the above categories and the review, generate an overall sentiment rating, displayed in the format x.xx, out of 5.00. Score between 0.00 and 1.00 if highly negative, 1.01 and 2.00 if negative, 2.01 and 3.00 if neutral, 3.01 and 4.00 if positive, and 4.01 and 5.00 if highly positive.\r\n    - Indicate if the sentiment rating is highly Positive, Positive, Neutral, Negative, or Highly Negative.\r\n    \r\n    {{ ctx.output_format }}\r\n  \"#\r\n}\r\n\r\nfunction CompareAnalysis(analysis1: string, analysis2: string) -> ProductComparison {\r\n  client \"openai/gpt-3.5-turbo\"\r\n  prompt #\"\r\n    Compare the following two product analysis texts\r\n    {{ analysis1 }}\r\n    {{ analysis2 }}\r\n\r\n    Provide the following information\r\n    - The name of each product (make sure they are concise and avoid unnecessary words)\r\n    - A summary comparing the two products\r\n    - Price of both products (Display in euros, in the format €x.xx)\r\n    - Specific source of price of both products (Must be from a retailer, if not, an official website. \"Product listing\", \"announcement\", etc. are not valid sources)\r\n    - Specifications of each product in a structured format\r\n    - The sentiment rating for each product (in the format x.xx/5.00)\r\n    - Indicate if the sentiment for each product is highly positive, positive, neutral, negative, or highly negative.\r\n\r\n    Very briefly compare the two products under the following headings:\r\n    - Value for Money\r\n    - Sound Quality\r\n    - Comfort & Fit\r\n    - Battery Life & Charging\r\n    - Connectivity & Compatibility\r\n    - Features & Controls\r\n    - Call Quality & Microphone Performance\r\n    - Brand & Warranty\r\n    - Reviews & User Feedback\r\n    - Availability & Local Factors\r\n\r\n\r\n    - Based on the comparison, recommend the better product. Note if a product is significantly cheaper or has a major advantage in any category.\r\n    \r\n    {{ ctx.output_format }}\r\n  \"#\r\n}\r\n\r\ntest compareAnalysisTest {\r\n  functions [CompareAnalysis]\r\n  args {\r\n    analysis1 #\"\r\n      \r\n      \"#\r\n    analysis2 #\"\r\n      \r\n      \"#\r\n\r\n  }\r\n}\r\n\r\n// Test the function with a sample review text.\r\ntest testProductAnalysis {\r\n  functions [AnalyzeProductReview]\r\n  args {\r\n    text #\"\r\n      \"The Canon 5D Mark III was released in March of 2012 as an update to the highly regarded 5D Mark II. Built on the success of its predecessor and featuring the most advanced autofocus system Canon has released to date from its EOS-1D X line, the Canon 5D Mark III is a rather promising upgrade to the 5D line. With an enhanced image sensor with ISO 100 to 25,600 native ISO range, fully weather-sealed camera body, 6 fps burst shooting speed and dual card support, the 5D Mark III seems to target all kinds of photography – from landscapes and fashion to sports and wildlife photography.\\nI have been shooting with the Canon 5D Mark III for close to three months by now. I received it around the same time when I got a hold of the Nikon D800 and it has been a very interesting journey, shooting with both of these cameras side-by-side. As you may already know, I have been a Nikonian for a while now and most of the camera and lens reviews I have published to date cover Nikon products. Starting from earlier this year, I decided to expand my reach to Sony, Fujifilm and Canon cameras and lenses. While I personally prefer to stay focused on my brand of choice, some of the tests I perform compare performance across brands, so I decided that it would be best for me to get familiar with other camera systems as well. So far I have been enjoying this process and my overall impression at the moment is that all camera systems out there have their own advantages and disadvantages, just like I stated in my Nikon vs Canon vs Sony article, and no one camera system is superior to another. In short, no camera is perfect. I own a lot of Nikon gear and prefer shooting with it because I started my journey into the world of digital photography with a Nikon DSLR. Had I started with a Canon or a Sony DSLR, my site would have been either Canon or Sony-centric instead.\\nAs I have already stated in some of my articles, I have been really enjoying the Canon 5D Mark III. I had a great experience with its predecessor, the Canon 5D Mark II, which I used a number of times before (many of my photography friends use Canon gear and I get to play with Canon gear quite a bit). So when the 5D Mark III was announced, I knew that I definitely wanted to try it out as well, but this time for an extended period of time with a few top Canon L lenses. Loaded with Canon EF 24mm f/1.4L, EF 50mm f/1.2L, EF 17-40mm f/4L lenses, I have been taking the camera with me everywhere – from personal trips shooting landscapes and nature, to commercial jobs.\\nWhile reading this review, you might find a number of negative remarks about the camera. As I have said earlier, no camera is perfect and the Canon 5D Mark III is not an exception. There are things I love about it and there are things that I find rather annoying as well. It does not mean that the camera is bad and it certainly does not make it inferior to its main competitor, the Nikon D800. It is a matter of personal taste and preference. At the end of the day, it is not all about the image sensor, ISO performance or camera speed – one should assess a system as a “package”. A lot of what I say about the 5D Mark III is obviously from the standpoint of a long time Nikon shooter, so you will find plenty of comparisons and references to Nikon in this review.\\nCanon 5D Mark III Specifications\\n- Sensor: 22.3 MP full frame CMOS sensor, 6.25µ pixel size\\n- Sensor Size: 36 x 24mm\\n- Resolution: 5760 x 3840\\n- Native ISO Sensitivity: 100-25,600\\n- Boost Low ISO Sensitivity: 50\\n- Boost High ISO Sensitivity: 51,200-102,400\\n- Sensor Cleaning System: Yes\\n- Image Processor: DIGIC 5+\\n- Autofocus System: 61-point high-density reticular AF (up to 41 cross-type points)\\n- Lens mount: Canon EF\\n- Weather Sealing/Protection: Yes\\n- Body Build: Full Magnesium Alloy\\n- Shutter: Up to 1/8000 and 30 sec exposure\\n- Storage: 1x CF and 1x SD (SD/SDHC/SDXC compatible)\\n- Viewfinder Type: Pentaprism with 100% coverage, 0.71x magnification\\n- Speed: 6 FPS\\n- Exposure Meter: 63 Zone iFCL Metering System\\n- Exposure Compensation: ±5 EV (at 1/3 EV, 1/2 EV steps)\\n- Built-in Flash: No\\n- LCD Screen: 3.2 inch diagonal with 1,040,000 dots\\n- Movie Modes: 1920 x 1080 (29.97, 25, 23.976 fps), 1280 x 720 (59.94, 50 fps), 640 x 480 (25, 30 fps)\\n- Movie Exposure Control: Full\\n- Movie Recording Limit: 30 minutes\\n- Movie Output: MOV (H.264)\\n- Built-in Microphone: Mono\\n- In-Camera HDR Capability: Yes\\n- GPS: Not built-in, requires GP-E2 GPS unit\\n- Battery Type: LP-E6\\n- Battery Life: 950 (CIPA)\\n- USB Standard: 2.0\\n- Weight: 860g (excluding battery)\\n- Price: $3,499 MSRP body only\\nA detailed list of camera specifications is available at Canon.com.\\nCanon 5D Mark III vs Canon 5D Mark II\\nWhat kind of changes does the Canon 5D Mark III bring to the table when compared to its predecessor, the Canon 5D Mark II? While detailed camera specification comparisons have already been provided in a separate Canon 5D Mark III vs 5D Mark II article, below is a short summary of changes and updates.\\n- Sensor Resolution: 22.3 Million (5D Mark III) vs 21.1 Million (5D Mark II)\\n- Native ISO Sensitivity: ISO 100-25,600 vs ISO 100-6,400\\n- Image Processor: DIGIC 5+ vs DIGIC 4\\n- Autofocus System: 61-point high-density reticular AF (up to 41 cross-type points) vs 9-point TTL (1 cross-type point)\\n- Viewfinder Coverage: 100% vs 98%\\n- Storage Media: 1xCF and 1xSD vs 1xCF\\n- Speed: 6 fps vs 3.9 fps\\n- Exposure Metering Sensor: iFCL metering with 63 zone dual-layer sensor vs TTL full aperture metering 35 zone SPC\\n- LCD Size: 3.2″ LCD vs 3.0″ LCD\\n- LCD Resolution: 1,040,000 dots vs 920,000 dots\\n- HDR Support: Yes vs No\\n- Chromatic Aberration Correction: Yes vs No\\n- Silent shutter: Yes vs No\\nThe above are the most significant differences – there are some other minor differences as well.\\nFirst, let’s talk about the camera sensor. While 22.3 MP vs 21.1 MP change might seem rather insignificant (nothing like the 24 MP jump from D700 to D800), the sensor on the 5D Mark III has gone through some interesting changes. Its ISO range has been expanded from 6,400 to 25,600 – two more full stops, as seen in product sheets and claimed by Canon. In reality, the situation is a little bit different, but I won’t disclose my findings quite yet, you will see my test results in the camera comparisons page of this review.\\nThe autofocus system on the 5D series cameras has been a source of complaints for a while now. When the Canon 5D Mark II was released, photographers were disappointed by the fact that Canon was still bundling its old 9 point AF system with only one cross-type sensor, while Nikon was shipping its advanced 51 point AF system on even its cropped-sensor cameras like Nikon D300s. This time around, after hearing so many complaints from its customers, Canon finally decided to change the AF system on the 5D line. And the new AF system is not a joke – it is the same one that Canon is using on its top-of-the-line Canon EOS 1D X camera.\\nFraming images has gotten better since the viewfinder finally offers 100% coverage. The LCD screen on the back of the camera has also gotten bigger with more dots to show more details. The DIGIC image processor gained some more power, which helped increase the speed of the camera from 3.9 fps to 6 fps (as a comparison, the Nikon D800 is limited to 4 fps). Faster speed means that the Canon 5D Mark III is now worth looking into as an option for sports and wildlife photography as well. A faster DIGIC 5+ processor also means that the Canon 5D Mark III can do some complex image processing – the camera can shoot in HDR and has built-in chromatic aberration correction, neither of which was possible on the 5D Mark II. Finally, the silent shutter of the 5D Mark III is a very useful feature when shooting in noise-sensitive environments.\\nAs you can see, there is quite a difference between the two cameras. The AF system alone is a huge change.\\nCanon 5D Mark III vs Nikon D800\\nWhen it comes to comparing the two cameras, one has to be very careful in assessing sensor performance. Since there is such a huge difference in sensor resolution, looking at images at 100% view (pixel level) will obviously give advantage to the Canon 5D Mark III, simply because the latter has bigger pixels and hence it’s per-pixel noise characteristics are going to be better. The proper comparison method, however, involves a down-sampling process, in which a higher-resolution image is resized to a smaller resolution. So in this case, the only proper way to compare the two cameras is to take a 36.3 MP image from the Nikon D800 and decrease it to Canon 5D Mark III’s 22.3 MP resolution. This can be easily done in post-processing software like Photoshop and Lightroom and the comparison of the two, along with my personal analysis are presented in my Nikon D800 Review. In short, once down-sampled, the Nikon D800 yields exceptionally good images at high ISO levels and actually looks slightly better than the 5D Mark III at ISO 3200 and above. Lastly, the dynamic range of the Nikon D800 is phenomenal. According to DxOMark, the Nikon D800 has a better dynamic range than all medium format cameras they have tested so far. The same cannot be said about the Canon 5D Mark III – its dynamic range is certainly inferior (see the “Dynamic Range” section of the review for more details). Let’s take a look at other differences in camera specifications – a full comparison is provided in my Canon 5D Mark III vs Nikon D800 article that I posted earlier.\\n- Sensor Resolution: 22.3 MP (Canon 5D Mark III) vs 36.3 MP (Nikon D800)\\n- Native ISO Sensitivity: ISO 100-25,600 vs ISO 100-6,400\\n- Boosted ISO Sensitivity: ISO 51,200-102,400 vs ISO 12,800-25,600\\n- Image Size: 5760 x 3840 vs 7360 x 4912\\n- Continuous Shooting Speed: 6 fps vs 4 fps\\n- Shutter Durability: 150,000 cycles vs 200,000 cycles\\n- Autofocus System: 61-point AF (up to 41 cross-type points) vs 51-point AF (up to 15 cross-type points)\\n- AF Detection: f/5.6 vs f/8\\n- Built-in Flash: No vs Yes\\n- AF Assist: No vs Yes\\n- Uncompressed Video Output: No vs Yes\\n- LCD Resolution: 1,040,000 dots vs 921,000 dots\\n- Battery Life: 950 shots (CIPA) vs 850 shots (CIPA)\\n- USB Version: 2.0 vs 3.0\\n- Weight: 860g vs 900g\\n- MSRP Price: $3,499 vs $2,999\\nAside from the above-mentioned differences in sensor resolution and ISO performance, the Canon 5D Mark III has faster shooting speed, more AF focus points with more cross-type sensors (more on the AF system of the 5D Mark III further below), better LCD screen, better battery life, and lighter body. On the flip side, its shutter durability is rated at 150K versus 200K on the D800, it has no built-in flash or AF assist for focusing in low-light environments, it has no uncompressed HDMI video output (only relevant to videographers) and it is $500 USD more expensive than the D800. In addition, the Nikon D800 can autofocus with lenses up to f/8, which means that if you have a slower f/4 lens, autofocus is still operational when a 2x teleconverter is used (certainly an advantage for wildlife photographers). Again, both have their pros and cons, so you have to weigh in which features are more important for your photography needs.\\nCamera Construction and Handling\\nJust like the older Canon 5D Mark II and the Nikon D800, the Canon 5D Mark III has a weather-sealed magnesium-alloy body, making it a very tough camera to use in pretty much any environment. As some people like to say, it surely is built like a tank. The camera feels very solid in hands and judging from its construction and build, it will last a very long time. I have taken the 5D Mark III with me to extremely humid temperatures (rainy May in Florida) and very cold weather (below freezing temperatures in Colorado mountains) and it performed flawlessly. High winds in a dusty area were also not a problem, although I would recommend being careful in such environments since dust can make its way into the camera through a lens (which is quite normal and applicable to all DSLR cameras).\\nHandling-wise, I find the Canon 5D Mark III to be superb. In fact, I actually prefer it to the D800, primarily because of its more extruded and very comfortable grip. The controls of the camera very much resemble the Canon 7D and I also find them to be designed very well – much better than on the 5D Mark II for sure. The camera is extremely customizable and many buttons on the camera can be set to perform different functions, which is expected from this class of a camera. The toughest thing to get used to was the lack of a rear dial. I am very used to the dual dial setup on Nikon DSLRs (with one on the front and one on the back), which makes it easy to change aperture and shutter speed in different camera modes. On the Canon 5D Mark III, the top rotary dial changes its behavior depending on what mode you are in. For example, in aperture priority mode, the dial changes the lens aperture; in shutter priority and manual modes, it changes the camera shutter speed. The big rotary dial on the back of the camera is used for exposure compensation in aperture and shutter priority modes and switches to changing the aperture in manual mode. It took some time to get used to this behavior, and to be honest, I still prefer the Nikon way.\\nThe left back side of the camera has a similar layout as the D800, except some of the buttons serve different purposes. I like the button placement, except for the “Rate” button. The good news is that if you choose to rate your photographs in your camera, the information is carried over to Lightroom and Aperture when the images are imported. On the other hand, why would you want to rate pictures on your camera looking at the tiny LCD screen in the first place? I sort through and rate my photographs in Lightroom and if there is something wrong with a picture I took, I simply delete it. When working in the field, I do not have the time to sit and look through images on the camera – I import them into my computer as soon as possible. And I know that I am not the only photographer that has such a workflow. I really wish the Rate button was swapped with another zoom button, just like on the D800. One button would be used for zooming in and another for zooming out. I prefer using two buttons to zoom in/out instead of pressing a button, then changing zoom levels with a rotary dial on the top of the camera. Nikon moved away from this bad ergonomic design on its pro cameras and Canon should have done the same.\\nThe viewfinder on the 5D Mark III is recessed very deep inside, making it almost impossible to clean it quickly. When the viewfinder fogged up, I had a hard time reaching the glass surface to wipe it. The Nikon D800, on the other hand, does not have this problem and its viewfinder eyepiece is very easy to reach and clean. Another design annoyance is the way the viewfinder is blocked. On the Nikon D800, there is a small switch on the top left side of the viewfinder that allows you to block the viewfinder when shooting at night. On the Canon 5D Mark III, you have to take off the eyepiece, then use a plastic piece on the camera strap to block the light. This is inconvenient and downright idiotic, in my opinion. I would rather use tape to block the viewfinder than do what Canon wants me to do.\\nThe LCD screen on the 5D Mark III is gorgeous. Canon used hardened glass protector in front of the LCD with anti-reflective coating, which makes it very practical to use in the field. The screen looks a little darker, but playing back images in an outdoor environment is a much better experience on the 5D Mark III than on the D800. You can see all the colors and you don’t have to use your hands to block sunlight, which is very nice. The Nikon D800 has no anti-reflective coating and both the LCD and the screen protector reflect like crazy.\\nAfter being used to Nikon’s multi-function button, getting used to a rotary dial with a separate joystick took me some time to get used to. I just have this thing against joysticks and I find them uncomfortable to use (yes, I dislike the two joysticks on the Nikon D4 as well and I wish Nikon did not steal the joystick idea from Canon). Plus, my thumb gets sore when I use a joystick for an extended period of time. Aside from the joystick, once I got used to the Canon layout, operating the camera was pretty easy.\\nLastly, one thing drove me nuts for a while, until I found a way to fix it. By default, the joystick on the back of the camera is programmed to do nothing when looking through the viewfinder, so it cannot be used for moving AF points. On Nikon DSLRs, the AF focus point is moved by the multi-function joystick. I just could not believe that I constantly had to press the AF selector button in order to change my focus point, so with the help of my friend Sergey (who is a long time Canon shooter), I was able to find a way to take care of this problem. Here are the instructions on how we did it: Press the “Info” button, then the “Q” button, then navigate to “Custom Controls” with the joystick, scroll down to the very last option “Multi-controller AF point direct selection” and set it to “AF point direct selection” instead of the default “OFF”. Once you do this, you will be able to change the AF focus point with the joystick.\\nOverall, I find the Canon 5D Mark III to be superior to the Nikon D800 in terms of handling, but I still prefer Nikon’s ergonomics.\\nTable of Contents\"\r\n    \"#\r\n  }\r\n}\r\n\r\n\r\n",
    "../c:\\Users\\Luke\\OneDrive - Atlantic TU\\Yr2Semester1\\Desktop\\OS\\Sentimentor\\backend\\productcomparator\\baml_src\\generators.baml": "// This helps use auto generate libraries you can use in the language of\n// your choice. You can have multiple generators if you use multiple languages.\n// Just ensure that the output_dir is different for each generator.\ngenerator target {\n    // Valid values: \"python/pydantic\", \"typescript\", \"ruby/sorbet\", \"rest/openapi\"\n    output_type \"python/pydantic\"\n\n    // Where the generated code will be saved (relative to baml_src/)\n    output_dir \"../\"\n\n    // The version of the BAML package you have installed (e.g. same version as your baml-py or @boundaryml/baml).\n    // The BAML VSCode extension version should also match this version.\n    version \"0.80.1\"\n\n    // Valid values: \"sync\", \"async\"\n    // This controls what `b.FunctionName()` will be (sync or async).\n    default_client_mode sync\n}\n",
}

def get_baml_files():
    return file_map
