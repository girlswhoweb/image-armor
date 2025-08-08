import React, { useEffect, useState } from 'react';
import { Card, Text, BlockStack, Collapsible, Button, InlineStack, Icon, ProgressBar, Layout } from '@shopify/polaris';
import { CancelMinor, CircleTickMajor } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useFindFirst } from '@gadgetinc/react';
import { useGadget } from '@gadgetinc/react-shopify-app-bridge';

export function Onboarding() {
  const { appBridge } = useGadget();
  const [isOpen, setIsOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({
    applyWatermark: false,
    disableRightClick: false,
    disableTextCopy: false,
    disableDev: false,
  });
  const navigate = useNavigate();

  const toggleOpen = () => setIsOpen(!isOpen);
  
  const [{ data, fetching, error }] = useFindFirst(api.onboarding);


  const handleClick = (handle) => {
    const shopUrl = appBridge.config.shop;
    const uuid = "9f0f7ef9-45f3-4614-9c0f-7c70d1ea4189"
    const url = `https://${shopUrl}/admin/themes/current/editor?context=apps&activateAppId=${uuid}/${handle}`;
    window.open(url, "_blank");
  }

  
  const steps = [
    {
      title: 'Add Watermark & Optimise Images',
      description: 'Add logo or text watermark to protect your store & optimise page load time with image compression.',
      action: () => navigate('/watermark'),
      buttonText: 'Add Watermark & Optimise Images',
      key: 'applyWatermark',
    },
    {
      title: 'Disable Right Click',
      description: 'This will prevent users from right clicking on your images to copy or download.',
      action: () => handleClick('disable-right-click'),
      buttonText: 'Disable Right Click',
      key: 'disableRightClick',
    },
    {
      title: 'Disable Text Copy',
      description: 'This will prevent users from copying text from your images.',
      action: () => handleClick('disable-text-selection'),
      buttonText: 'Disable Text Copy',
      key: 'disableTextCopy',
    },
    {
      title: 'Disable Dev Panel',
      description: "This will prevent users from using the browser's developer tools to inspect your images.",
      action: () => handleClick('disable-dev-console'),
      buttonText: 'Disable Dev Panel',
      key: 'disableDev',
    },
  ];

  useEffect(() => {
    if (data) {
      if(!data.applyWatermark || !data.disableRightClick || !data.disableTextCopy || !data.disableDev) {
        setIsOpen(true);
      }
      setCompletedSteps(data);
    } else {
      setIsOpen(true);
    }
  }, [data, fetching]);

  const handleMarkCompleted = async (key) => {
    shopify.toast.show('Updating...');
    
    const newCompletedSteps = {  
      applyWatermark: completedSteps.applyWatermark,
      disableRightClick: completedSteps.disableRightClick,
      disableTextCopy: completedSteps.disableTextCopy,
      disableDev: completedSteps.disableDev,
    };

    newCompletedSteps[key] = true;

    if(completedSteps.id) {
      newCompletedSteps.id = completedSteps.id;
    }
    
    const shop = await api.shopifyShop.findFirst();
    
    await api.onboarding.upsert({
      shop: {
        _link: shop.id,
      },
      ...newCompletedSteps
    });
  }

  const handleClose = async () => {
    shopify.toast.show('Updating...');
    
    const newCompletedSteps = {  
      applyWatermark: true,
      disableRightClick: true,
      disableTextCopy: true,
      disableDev: true,
    };

    if (completedSteps.id) {
      newCompletedSteps.id = completedSteps.id;
    }

    const shop = await api.shopifyShop.findFirst();
    
    await api.onboarding.upsert({
      shop: {
        _link: shop.id,
      },
      ...newCompletedSteps
    });
  }

  if(fetching || Object.keys(completedSteps).filter(stepKey => 
    completedSteps[stepKey] === true && ['applyWatermark', 'disableRightClick', 'disableTextCopy', 'disableDev'].includes(stepKey)
  ).length === steps.length) {
    return null;
  }

  return (
    <Card>
      <BlockStack gap="400">
        {/* <Text variant="headingSm">Let's get you setup</Text> */}
        <InlineStack align="space-between" blockAlign="center" gap="300">
          <div style={{ flex: "1" }}>
            <Button
              onClick={toggleOpen}
              ariaExpanded={isOpen}
              ariaControls="steps-content"
              disclosure={isOpen ? 'up' : 'down'}
              variant="monochromePlain"
              textAlign="left"
            >
              <Text variant="headingSm">Let's get you setup</Text>
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: "flex-end", gap: '5px' }}>
            <Text breakWord={false}>Step {Object.keys(completedSteps).filter(stepKey => 
                completedSteps[stepKey] === true && ['applyWatermark', 'disableRightClick', 'disableTextCopy', 'disableDev'].includes(stepKey)
              ).length} of {steps.length} completed</Text>
            <ProgressBar 
              progress={(Object.keys(completedSteps).filter(stepKey => 
                completedSteps[stepKey] === true && ['applyWatermark', 'disableRightClick', 'disableTextCopy', 'disableDev'].includes(stepKey)
              ).length / steps.length) * 100} 
              size="small" 
            />
          </div>
          <div style={{ cursor: 'pointer' }} onClick={handleClose}>
            <Icon source={CancelMinor} />
          </div>
        </InlineStack>
        <Collapsible open={isOpen} id="steps-content">
          <BlockStack gap="400" align="start" inlineAlign="stretch">
            {steps.map((step, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'stretch' }}>
                <div style={{ 
                  marginRight: '16px', 
                  minWidth: '24px', 
                  paddingTop: '2px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: "start",
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  {completedSteps?.[step.key] ? (
                    <Icon source={CircleTickMajor} color="success" />
                  ) : (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px dashed var(--p-color-border-tertiary)' }} />
                  )}
                  {index < steps.length - 1 && (
                    <div style={{ width: '2px', flex: '1', backgroundColor: 'var(--p-color-border-secondary)' }} />
                  )}
                </div>
                <BlockStack gap="200" inlineAlign="start">
                  <Text variant="headingSm"><span style={{ color: '#d773aa' }}>{step.title}</span></Text>
                  <Text variant="bodyMd">{step.description}</Text>
                  <InlineStack gap="200">
                    <Button 
                      onClick={() => {
                        step.action();
                      }} 
                      // variant="tertiary"
                    >
                      {step.buttonText}
                    </Button>
                    {!completedSteps?.[step.key] && (
                      <Button variant="tertiary" onClick={() => handleMarkCompleted(step.key)}>Mark Completed</Button>
                    )}
                  </InlineStack>
                </BlockStack>
              </div>
            ))}
          </BlockStack>
        </Collapsible>
      </BlockStack>
    </Card>
  );
}