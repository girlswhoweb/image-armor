import React from 'react';
import { Page, Layout, Card, Text, Icon, Banner } from "@shopify/polaris";
import { AlertMinor } from '@shopify/polaris-icons';

const Maintenance = () => {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <div style={{ maxWidth: '600px', margin: '40px auto' }}>
            {/* <Banner
              title="System Maintenance"
              status="warning"
              icon={AlertMinor}
            >
              <p>
                We're currently performing scheduled maintenance to improve our services.
                We'll be back shortly. Thank you for your patience.
              </p>
            </Banner> */}
            <Card sectioned>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ marginBottom: '20px' }}>
                  <Icon source={AlertMinor} color="warning" />
                </div>
                <Text variant="headingLg" as="h2">
                  Scheduled Maintenance in Progress
                </Text>
                <br />
                <Text variant="bodyMd" as="p">
                  We're working hard to improve our system and will be back online soon.
                  During this time, some features may be temporarily unavailable.
                </Text>
                <br />
                <Text variant="bodySm" as="p" color="subdued">
                  Expected completion: Within the next few hours
                </Text>
              </div>
            </Card>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Maintenance; 