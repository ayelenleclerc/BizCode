/**
 * Smoke load test against a running API (not executed in default CI).
 * Prerequisites: k6 CLI installed (https://k6.io/docs/get-started/installation/), API reachable.
 *
 * Example:
 *   set BASE_URL=http://127.0.0.1:3001
 *   npm run perf:smoke
 */
import http from 'k6/http'
import { check, sleep } from 'k6'

const baseUrl = __ENV.BASE_URL || 'http://127.0.0.1:3001'

export const options = {
  vus: 2,
  duration: '15s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
}

export default function () {
  const res = http.get(`${baseUrl}/api/health`)
  check(res, {
    'health 200': (r) => r.status === 200,
    'health body ok': (r) => {
      try {
        const b = JSON.parse(r.body)
        return b.status === 'ok'
      } catch {
        return false
      }
    },
  })
  sleep(0.3)
}
