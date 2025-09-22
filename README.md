# Flame Charts

This repository is an instrumentator for C++ projects to produce profiling traces and display them as flame charts.

## Use them in your C++ projects

The code is a single header, so there is no need for installation. To use it I would recommend to create a special header file to easily turn on and off profiling.

```c++
#pragma once

#define USE_PROFILING

#if defined USE_PROFILING

#include "profiler/profiler.hpp"

#else

#define PROFILER_START_SESSION(filename, id)
#define PROFILER_END_SESSION()

#define PROFILE_SCOPE(name)
#define PROFILE_FUNCTION

#define PROFILE_PARALLEL_SCOPE(name, N)
#define PROFILE_PARALLEL_FUNCTION(N)

#endif
```

and turn on and off (by commenting) the line `#define USE_PROFILING`.

### Examples

Feel free to take a look at the [examples](profiler/examples) to see how to profile your code with this instrumentator.

To compile the examples, simply navigate to the examples directory and use the `make` command:

```bash
$ cd profiler/examples
$ make -j3
$ ./single_threaded
$ ./multi_threaded_1
$ ./multi_threaded_2
```

Each execution will produce a `.json` file containing a profile trace.

## Visualizing a profile trace

This project comes with an in-browser viewer that you can use to visualize profile traces. Read the [README](viewer/README.md) for further instructions on how to use it.
