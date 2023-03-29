import StatsD from "node-statsd";

const client = new StatsD({
    globalize: true,
    port:3001
});

export default client