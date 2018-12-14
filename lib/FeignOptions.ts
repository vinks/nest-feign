import { AxiosRequestConfig } from 'axios';

export interface FeignOptions {
    adapter?: string;
    axiosConfig?: AxiosRequestConfig;
    brakesConfig?: BrakesConfig;
}

export interface BrakesConfig {
    /**
     * to use for name of circuit. This is mostly used for reporting on stats.
     */
    name?: string;

    /**
     *  to use for group of circuit. This is mostly used for reporting on stats.
     */
    group?: string;

    /**
     * time in ms that a specific bucket should remain active.
     */
    bucketSpan?: number;

    /**
     * interval in ms that brakes should emit a snapshot event.
     */
    statInterval?: number;

    /**
     * array<number> that defines the percentile levels that should be calculated on the stats object
     * (i.e. 0.9 for 90th percentile).
     */
    percentiles?: number[];

    /**
     * # of buckets to retain in a rolling window.
     */
    bucketNum?: number;

    /**
     *  time in ms that a circuit should remain broken
     */
    circuitDuration?: number;

    /**
     * number of requests to wait before testing circuit health
     */
    waitThreshold?: number;

    /**
     * % threshold for successful calls. If the % of successful calls dips below this threshold the circuit will break
     * timeout: time in ms before a service call will timeout
     */
    threshold?: string;

    /**
     * function that returns true if an error should be considered a failure
     * (receives the error object returned by your command.)
     * This allows for non-critical errors to be ignored by the circuit breaker
     */
    isFailure?: () => boolean;

    /**
     * time in ms interval between each execution of health check function
     */
    healthCheckInterval?: number;

    /**
     * function to call for the health check (can be defined also with calling healthCheck function)
     * @param callback
     */
    healthCheck?: () => Promise<any>;

    /**
     * function to call for fallback (can be defined also with calling fallback function)
     * @param callback
     */
    fallback?: () => Promise<any>;
}
