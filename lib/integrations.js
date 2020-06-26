'use strict';

const merge = require('deepmerge');
const { addEventHook } = require('./event-hook');
const {
    INTEGRATION_CREATED,
    INTEGRATION_UPDATED,
    INTEGRATION_DELETED,
} = require('./event-type');

let logger;
let providersMap;
let integrations;

function eventHook(event, eventData) {
    integrations.forEach(integration => {
        const provider = providersMap[integration.provider];

        provider.eventHandler.call(integration, event, eventData);
    });
}

function loadIntegration(integration, getLogger) {
    const provider = providersMap[integration.provider];

    if (provider === undefined) {
        logger.warn(
            `Integration '${integration.description}' (${integration.id}) is configured to use unknown provider '${integration.provider}' and will not be loaded!`,
        );
        return false;
    }

    // eslint-disable-next-line no-param-reassign
    integration.logger = getLogger(
        `integration:${integration.id}:${integration.provider}`,
    );

    return integration;
}

async function configureIntegrations(integrationsStore, eventStore, getLogger) {
    logger = getLogger('integrations.js');
    providersMap = integrationsStore.getProviders();

    integrations = await integrationsStore
        .getIntegrations()
        .filter(i => loadIntegration(i, getLogger));

    addEventHook(eventHook, eventStore);

    eventStore.on(INTEGRATION_CREATED, event => {
        const integration = event.data;
        integrations.push(integration);
        loadIntegration(integration, getLogger);
    });

    eventStore.on(INTEGRATION_UPDATED, event => {
        const updatedIntegration = event.data;
        integrations = integrations.map(i =>
            i.id === updatedIntegration.id
                ? loadIntegration(merge(i, updatedIntegration), getLogger)
                : i,
        );
    });

    eventStore.on(INTEGRATION_DELETED, event => {
        const integration = event.data;
        integrations = integrations.filter(i => i.id !== integration.id);
    });
}

module.exports = {
    configureIntegrations,
};
