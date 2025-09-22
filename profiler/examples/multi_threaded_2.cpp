/*********************************************************************
 *
 * Examples of Profiling instrumentator and viewer
 *
 * Copyright (C) 2025
 *
 * This file is part of "Profiling instrumentator and viewer". The full code is
 * available at:
 *      https://github.com/lluisalemanypuig/flame-charts.git
 *
 * Profiling instrumentator and viewer is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Profiling instrumentator and viewer is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Linear Arrangement Library.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Contact:
 *
 *     Lluís Alemany Puig (lluis.alemany.puig@gmail.com)
 *	   https://github.com/lluisalemanypuig
 *
 ********************************************************************/

// C++ includes
#include <iostream>
#include <thread>

#include "profiler/profiler.hpp"

void function_3(const int k)
{
	PROFILE_FUNCTION;

	for (int i = 0; i < k; ++i) {
		std::cout << "You are great!\n";
	}
}

void function_2(const int k)
{
	PROFILE_FUNCTION;

	for (int i = 0; i < k; ++i) {
		std::cout << "You are amazing\n";
	}
}

void function_1(const int k)
{
	// always start a logger with a function logger
	PROFILE_FUNCTION;

	for (int i = 0; i < k; ++i) {
		function_2(i);
	}

	{
		// you can time scopes within a function
		PROFILE_SCOPE("scope 1");
		for (int i = 0; i < k; ++i) {
			function_3(i);
		}
	}
	{
		// you can time scopes within a function
		PROFILE_SCOPE("scope 2");
		for (int i = 0; i < k; ++i) {
			function_3(i);
		}
	}

	for (int i = 0; i < k; ++i) {
		function_2(i);
	}
}

using namespace std::chrono_literals;

void multi_thread_fast(const int n)
{
	PROFILE_FUNCTION;

	{
		PROFILE_SCOPE("scope 1");
		for (int i = 0; i < n; ++i) {
			function_3(i);
			std::this_thread::sleep_for(1ms);
		}
	}

	{
		PROFILE_SCOPE("scope 2");
		for (int i = 0; i < n; ++i) {
			function_3(i);
			std::this_thread::sleep_for(2ms);
		}
	}
}

void multi_thread_slow(const int n)
{
	PROFILE_FUNCTION;

	{
		PROFILE_SCOPE("scope 1");
		for (int i = 0; i < n; ++i) {
			function_2(i);
			std::this_thread::sleep_for(100ms);
		}
	}

	{
		PROFILE_SCOPE("scope 2");
		for (int i = 0; i < n; ++i) {
			function_3(i);
			std::this_thread::sleep_for(200ms);
		}
	}
}

void multi_multi_thread()
{
	PROFILE_PARALLEL_FUNCTION(2);

	std::thread t2(multi_thread_slow, 2);
	std::thread t1(multi_thread_fast, 100);

	t1.join();
	t2.join();
}

int main()
{
	const bool status_profiler_session = PROFILER_START_SESSION(
		"session_multi_threaded_2.json", "session_multi_threaded_2"
	);
	if (not status_profiler_session) {
		return 1;
	}

	PROFILE_FUNCTION;

	{
		PROFILE_SCOPE("scope 1");
		function_3(2);
	}

	std::cout << "Launch multithreaded\n";

	{
		PROFILE_PARALLEL_SCOPE("par scope 2", 3);
		std::thread t2(multi_thread_slow, 2);
		std::thread t1(multi_thread_fast, 2);
		std::thread t3(multi_multi_thread);

		t2.join();
		t1.join();
		t3.join();
	}

	{
		PROFILE_SCOPE("scope 3");
		function_1(2);
	}

	std::cout << "Hey!\n";
}
