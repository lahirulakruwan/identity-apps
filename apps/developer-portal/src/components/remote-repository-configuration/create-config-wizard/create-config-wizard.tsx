/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { FunctionComponent, ReactElement, useState } from "react";
import { TestableComponentInterface, AlertInterface, AlertLevels } from "@wso2is/core/dist/src/models";
import { Modal, Grid, Icon } from "semantic-ui-react";
import { Heading, Steps, LinkButton, PrimaryButton } from "@wso2is/react-components";
import { RemoteRepoConfigDetails } from "./remote-repo-config";
import { RolesWizardStepIcons } from "../../../configs";
import { useTrigger } from "@wso2is/forms";
import { createRemoteRepoConfig } from "../../../api";
import { InterfaceRemoteRepoConfigDetails, InterfaceRemoteConfigForm } from "../../../models";
import { AxiosResponse } from "axios";
import { useDispatch } from "react-redux";
import { addAlert } from "@wso2is/core/dist/src/store";
import { useTranslation } from "react-i18next";

interface CreateRemoteRepoConfigProps extends TestableComponentInterface {
    closeWizard: () => void;
    updateList: () => void;
    initStep?: number;
}

export const CreateRemoteRepoConfig: FunctionComponent<CreateRemoteRepoConfigProps> = (
    props: CreateRemoteRepoConfigProps
): ReactElement => {

    const { t } = useTranslation();

    const { 
        closeWizard,
        initStep,
        updateList,
        [ "data-testid" ]: testId
    } = props;
    
    const dispatch = useDispatch();

    const [ finishSubmit, setFinishSubmit ] = useTrigger();
    const [ currentStep, setCurrentWizardStep ] = useState<number>(0);

    const handleFormSubmit = (values: InterfaceRemoteConfigForm): void => {
        const configs: InterfaceRemoteRepoConfigDetails = {
            actionListener: {
                type: "POLLING",
                attributes: {
                    frequency: values.pollingfreq
                }
            },
            configurationDeployer: {
                attributes: {},
                type: "SP"
            },
            isEnabled: values.configEnabled,
            remoteFetchName: values.configName,
            repositoryManager: {
                attributes: {
                    accessToken: values.accessToken,
                    branch: values.gitBranch,
                    directory: values.gitDirectory,
                    uri: values.gitUrl,
                    userName: values.userName
                },
                type: "GIT"
            }
        }
        createTemplateType(configs);
    };

    /**
     * Dispatches the alert object to the redux store.
     *
     * @param {AlertInterface} alert - Alert object.
     */
    const handleAlerts = (alert: AlertInterface) => {
        dispatch(addAlert(alert));
    };

    const createTemplateType = (templateTypeName: InterfaceRemoteRepoConfigDetails): void => {
        createRemoteRepoConfig(templateTypeName).then((response: AxiosResponse) => {
            if (response.status === 201) {
                handleAlerts({
                    description: t(
                        "devPortal:components.remoteConfig.notifications.createConfig.success.description"
                    ),
                    level: AlertLevels.SUCCESS,
                    message: t(
                        "devPortal:components.remoteConfig.notifications.createConfig.success.message"
                    )
                });
            }
            closeWizard();
            updateList();
        }).catch(error => {
            handleAlerts({
                description: error.response.data.description,
                level: AlertLevels.ERROR,
                message: t(
                    "devPortal:components.remoteConfig.notifications.createConfig.genericError.message"
                )
            });
        })
    };

    const WIZARD_STEPS = [{
        content: (
            <RemoteRepoConfigDetails
                onSubmit={ (values) =>  handleFormSubmit(values) }
                triggerSubmit={ finishSubmit }
                data-testid={ `${ testId }-form` }
            />
        ),
        icon: RolesWizardStepIcons.general,
        title: "Remote Repository General Configurations"
    }];

    
    return (
        <Modal
            open={ true }
            className="wizard create-role-wizard"
            dimmer="blurring"
            size="small"
            onClose={ closeWizard }
            closeOnDimmerClick={ false }
            closeOnEscape= { false }
            data-testid={ testId }
        >
            <Modal.Header className="wizard-header">
                Create a Remote Repository Confuguration.
                <Heading as="h6">
                    Start creating a remote repository configuration.
                </Heading>
            </Modal.Header>
            <Modal.Content className="steps-container">
                <Steps.Group
                    current={ currentStep }
                >
                    { WIZARD_STEPS.map((step, index) => (
                        <Steps.Step
                            key={ index }
                            icon={ step.icon }
                            title={ step.title }
                        />
                    )) }
                </Steps.Group>
            </Modal.Content>
            <Modal.Content className="content-container" scrolling>
                { WIZARD_STEPS[ currentStep ].content }
            </Modal.Content>
            <Modal.Actions>
                <Grid>
                    <Grid.Row column={ 1 }>
                        <Grid.Column mobile={ 8 } tablet={ 8 } computer={ 8 }>
                            <LinkButton
                                floated="left"
                                onClick={ () => { closeWizard() } }
                                data-testid={ `${ testId }-cancel-button` }
                            >
                                { t("cancel") }
                            </LinkButton>
                        </Grid.Column>
                        <Grid.Column mobile={ 8 } tablet={ 8 } computer={ 8 }>
                            <PrimaryButton
                                floated="right"
                                onClick={ setFinishSubmit }
                                data-testid={ `${ testId }-create-button` }
                            >
                                { "Create Configuration" }
                            </PrimaryButton>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Modal.Actions>
        </Modal>
    );
}
