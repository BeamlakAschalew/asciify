# ASCIIFY
## A small web app that utilizes JIMP to convert images into ASCII characters.

<p>ASCIIFY is a small web app that tries to convert an image into bunch of ascii characters by converting the images into greyscale and trying to match the weight of each pixel into a single character<br>
i.e. If a pixel is closer to dark it will be presented by a characters that look heavy to the eye like '@', if the pixel's greyscale value is closer to white it'll map that pixel into a visually lighter character like '.' or ':'.<br>
It works best on images that have a nice contrast and that don't have many elements appearing in the background like a headshot.<br>
The script loads JIMP and tries to do the computation on your machine because of that no image is sent to an external server, all computation is done using the host resources.
</p>
