# FOOP Cat 'n Mouse game in Eiffel

## Pre-requisites
On Windows, I suppose [EiffelStudio](https://github.com/EiffelSoftware/EiffelStudio) is useful to install.
Only the compiler is needed, theoretically, though.
Definitely download the appropriate (archive) from [here](https://account.eiffel.com/downloads) this will be needed for base-libraries.

On MacOS, you can only install/use the compiler anyways.
It can be installed via brew: `brew install eiffelstudio`
(Unless you have an x86 Mac, GUI won't work anyways so that's enough)

## Building
Using the compiler on the CLI directly, the project can be built as follows:
`ec -config catnmouse.ecf`

It _might_ be necessary to export an environment variable `ISE_LIBRARY` first.
This variable should point to the installation folder of Eiffel, i.e. to the unpacked folder that you downloaded from the official eiffel downloads site.


Build-output will be generated into `./EIFGENs/catnmouse/`, the binary will be located in `./EIFGENs/catnmouse/W_code/eiffel-catnmouse`.
Under Windows it will (probably) generate an EXE.
Supposedly the project can be easily opened in EiffelStudio to allow compilation and execution as well.

## Build errors
Sometimes (re-)building results in `Melting system changes` as the compiler will put it.
This can be fixed by running the following command:
`ec -config catnmouse -clean && (cd ./EIFGENs/catnmouse/W_code; finish_freezing)`

Hopefully the binary will be built properly again with this, else there's probably some configuration error.