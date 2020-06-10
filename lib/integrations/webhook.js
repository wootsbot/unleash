'use strict';

const axios = require('axios');

module.exports = {
    name: 'webhook',
    displayName: 'Webhook',
    parameters: [
        {
            name: 'url',
            displayName: 'Webhook URL',
            type: 'string',
        },
        {
            name: 'headers',
            displayName: 'Header Template',
            type: 'text',
        },
        {
            name: 'body',
            displayName: 'Body Template',
            type: 'text',
        },
    ],
    // eslint-disable-next-line object-shorthand
    eventHandler: function(event, eventData) {
        this.logger.info(
            `Received ${event} with data:\n${JSON.stringify(eventData)}`,
        );

        const url = this.parameters.find(p => p.name === 'url');

        const body = {
            text: 'test',
        };

        axios
            .post(url.value, body)
            .then(res => {
                this.logger.info(res);
            })
            .catch(error => {
                this.logger.error(error.toString());
            });
    },
};
