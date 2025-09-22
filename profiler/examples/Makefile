EXES = single_threaded \
	multi_threaded_1 \
	multi_threaded_2

all: $(EXES)

INCLUDE_PATH = -I../..
DEPS = ../profiler.hpp
FLAGS = -std=c++23 -UDEBUG -O3
LIBS = 

single_threaded: single_threaded.cpp $(DEPS)
	g++ $(FLAGS) -o single_threaded single_threaded.cpp $(INCLUDE_PATH) $(LIBS)

multi_threaded_1: multi_threaded_1.cpp $(DEPS)
	g++ $(FLAGS) -o multi_threaded_1 multi_threaded_1.cpp $(INCLUDE_PATH) $(LIBS)

multi_threaded_2: multi_threaded_2.cpp $(DEPS)
	g++ $(FLAGS) -o multi_threaded_2 multi_threaded_2.cpp $(INCLUDE_PATH) $(LIBS)

clean:
	rm -f $(EXES)
