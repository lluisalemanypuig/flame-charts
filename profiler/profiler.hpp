/*********************************************************************
 *
 * Profiling instrumentator and viewer
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

#pragma once

// C++ includes
#if defined DEBUG
#include <cassert>
#endif
#include <fstream>
#include <chrono>
#include <vector>
#include <mutex>
#include <latch>

namespace profiler {
namespace detail {

using unit_time_t = std::chrono::nanoseconds;

typedef std::chrono::high_resolution_clock::time_point time_point;

// Returns the current time
[[nodiscard]] static inline time_point now() noexcept
{
	return std::chrono::high_resolution_clock::now();
}

// Returns the elapsed time between \"begin\" and \"end\" in @ref unit_time_t
[[nodiscard]] static inline double
elapsed_time(const time_point& begin, const time_point& end)
{
	return std::chrono::duration<double, unit_time_t::period>(end - begin)
		.count();
}

enum class profiler_type {
	session,
	function,
	scope,
	parallel_function,
	parallel_scope
};

[[nodiscard]] static constexpr inline std::string_view
profiler_type_to_string(const profiler_type t)
{
	switch (t) {
	case profiler_type::session:		   return "session";
	case profiler_type::function:		   return "function";
	case profiler_type::parallel_function: return "parallel_function";
	case profiler_type::scope:			   return "scope";
	case profiler_type::parallel_scope:	   return "parallel_scope";
	default:							   return "?";
	}
	return "!";
}

[[nodiscard]] static constexpr inline bool is_parallel(const profiler_type t)
{
	switch (t) {
	case profiler_type::parallel_function:
	case profiler_type::parallel_scope:	   return true;
	default:							   return false;
	}
	return false;
}

struct stack_info {
	uint16_t num_calls;
	profiler_type type;
	std::unique_ptr<std::mutex> mutex;
	std::unique_ptr<std::latch> latch;
};

} // namespace detail

class session {
public:

	session(const session&) = delete;
	session(session&&) = delete;
	session& operator= (const session&) = delete;
	session& operator= (session&&) = delete;

	static session& get_instance() noexcept
	{
		static session instance;
		return instance;
	}

	// start session
	inline bool
	start(const std::string_view filename, const std::string_view sid)
	{
		fout.open(filename.data());
		if (not fout.is_open()) {
			m_current_session = false;
			return false;
		}
		fout.setf(std::ios::fixed);
		fout.precision(3);
		fout << "{\"session_id\":\"" << sid << "\",\"functions\":[";

		stack.reserve(512);
		stack.push_back(
			{.num_calls = 0,
			 .type = detail::profiler_type::session,
			 .mutex = std::make_unique<std::mutex>(),
			 .latch = std::make_unique<std::latch>(1)}
		);
		m_current_session = true;

		entry_time = detail::now();
		return true;
	}

	inline void end()
	{
		fout.flush();
		fout.close();
		m_current_session = false;
	}

	[[nodiscard]] inline double
	get_time_since_entry(const detail::time_point& p) const
	{
		return detail::elapsed_time(entry_time, p);
	}

	// end the session
	~session()
	{
		fout << "]}";
		end();
	}

public:

	detail::time_point entry_time;
	std::ofstream fout;
	std::vector<detail::stack_info> stack;

private:

	bool m_current_session;

private:

	session() { }
};

class timer {
public:

	timer() = default;
	timer(const timer&) = default;
	timer(timer&&) = default;
	timer& operator= (const timer&) = default;
	timer& operator= (timer&&) = default;

	virtual ~timer()
	{
		end();
	}

	inline void start(
		const std::string_view func_name,
		const int line,
		const detail::profiler_type current_type,
		const std::size_t num_threads = 1
	)
	{
		m_profile_begin = detail::now();

		m_function_name = func_name;
		m_line = line;
		m_type = current_type;

		auto& s = session::get_instance();
#if defined DEBUG
		assert(session.stack.size() > 0);
#endif
		auto& last = s.stack.back();

		if (detail::is_parallel(s.stack.back().type)) {

#if defined DEBUG
			assert(last.latch);
			assert(last.mutex);
#endif

			last.latch->arrive_and_wait();
			last.mutex->lock();
		}

		const bool needs_comma = last.num_calls > 0;
		if (needs_comma) {
			s.fout << ',';
		}

		last.num_calls += 1;

		s.stack.push_back(
			{.num_calls = 0,
			 .type = m_type,
			 .mutex = std::make_unique<std::mutex>(),
			 .latch = std::make_unique<std::latch>(num_threads)}
		);

		s.fout << "{\"c\":[";

		m_begin = detail::now();
	}

	inline void end() const
	{
		const detail::time_point end = detail::now();

		auto& s = session::get_instance();

		s.stack.pop_back();

		auto& last = s.stack.back();
		if (detail::is_parallel(last.type)) {
			last.mutex->unlock();
		}

		const detail::time_point pend = detail::now();
		s.fout << "],\"n\":\"" << m_function_name << "\",\"ti\":\""
			   << std::this_thread::get_id() << "\",\"t\":\""
			   << detail::profiler_type_to_string(m_type) << "\",\"l\":\""
			   << m_line
			   << "\",\"pb\":" << s.get_time_since_entry(m_profile_begin)
			   << ",\"b\":" << s.get_time_since_entry(m_begin)
			   << ",\"e\":" << s.get_time_since_entry(end)
			   << ",\"pe\":" << s.get_time_since_entry(pend) << '}';
	}

protected:

	std::string_view m_function_name;
	detail::profiler_type m_type;
	uint16_t m_line;
	detail::time_point m_profile_begin;
	detail::time_point m_begin;
};

} // namespace profiler

#define PROFILER_START_SESSION(filename, id)                                   \
	profiler::session::get_instance().start(filename, id)

#define PROFILER_END_SESSION() logger::session::get_instance().end()

#define VAR_NAME(line) timer##line

// sequential timer

#define PROFILE_OBJECT(name, line, type)                                       \
	profiler::timer VAR_NAME(line);                                            \
	VAR_NAME(line).start(name, __LINE__, type)

#define PROFILE_SCOPE(name)                                                    \
	PROFILE_OBJECT(name, __LINE__, profiler::detail::profiler_type::scope)

#define PROFILE_FUNCTION                                                       \
	PROFILE_OBJECT(                                                            \
		__PRETTY_FUNCTION__,                                                   \
		__LINE__,                                                              \
		profiler::detail::profiler_type::function                              \
	)

// parallel timer

#define PROFILE_PARALLEL_OBJECT(name, line, type, num_threads)                 \
	profiler::timer VAR_NAME(line);                                            \
	VAR_NAME(line).start(name, __LINE__, type, num_threads)

#define PROFILE_PARALLEL_SCOPE(name, N)                                        \
	PROFILE_PARALLEL_OBJECT(                                                   \
		name, __LINE__, profiler::detail::profiler_type::parallel_scope, N     \
	)

#define PROFILE_PARALLEL_FUNCTION(N)                                           \
	PROFILE_PARALLEL_OBJECT(                                                   \
		__PRETTY_FUNCTION__,                                                   \
		__LINE__,                                                              \
		profiler::detail::profiler_type::parallel_function,                    \
		N                                                                      \
	)
