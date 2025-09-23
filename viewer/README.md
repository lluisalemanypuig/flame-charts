# Viewer for profiling traces

This project is a serverless application built using TypeScript. It consists of a viewer that renders an HTML interface and utilizes TypeScript for its logic.

## Setup Instructions

1. Install the dependencies and tools:

    - `tsc`: a TypeScript compiler.
    - `esbuild`: a fast JavaScript bundler and minifier that helps optimize and package your code for deployment.

2. Compile the source code with the command

    `$ ./build/compile.sh`

3. Open the `viewer/index.html` file in a web browser to view the application.

4. Use the `Browse...` button at the top left corner to import a profiling trace. You can generate examples of traces using the programs in the [profiler/examples](profiler/examples) directory.
