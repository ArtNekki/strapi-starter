import type { Schema, Attribute } from '@strapi/strapi';

export interface SharedButton extends Schema.Component {
  collectionName: 'components_shared_buttons';
  info: {
    displayName: 'button';
    icon: 'compress';
  };
  attributes: {
    theme: Attribute.Enumeration<['primary', 'secondary', 'muted']> &
      Attribute.Required &
      Attribute.DefaultTo<'primary'>;
    link: Attribute.Component<'shared.link'>;
  };
}

export interface SharedCard extends Schema.Component {
  collectionName: 'components_shared_cards';
  info: {
    displayName: 'card';
    icon: 'sim-card';
  };
  attributes: {
    title: Attribute.String;
    text: Attribute.String;
    image: Attribute.Media;
  };
}

export interface SharedComment extends Schema.Component {
  collectionName: 'components_shared_comments';
  info: {
    displayName: 'comment';
    icon: 'comment-dots';
  };
  attributes: {
    content: Attribute.Text;
  };
}

export interface SharedFooterColumns extends Schema.Component {
  collectionName: 'components_shared_footer_columns';
  info: {
    displayName: 'footerColumns';
    icon: 'align-left';
  };
  attributes: {
    links: Attribute.Component<'shared.link', true>;
  };
}

export interface SharedHeader extends Schema.Component {
  collectionName: 'components_shared_headers';
  info: {
    displayName: 'header';
    icon: 'heading';
    description: '';
  };
  attributes: {
    theme: Attribute.Enumeration<['primary', 'secondary', 'muted']> &
      Attribute.DefaultTo<'primary'>;
    label: Attribute.String;
    title: Attribute.String;
  };
}

export interface SharedLink extends Schema.Component {
  collectionName: 'components_shared_links';
  info: {
    displayName: 'link';
    icon: 'backward';
  };
  attributes: {
    href: Attribute.String & Attribute.Required;
    label: Attribute.String & Attribute.Required;
    target: Attribute.Enumeration<['_blank']>;
    isExternal: Attribute.Boolean & Attribute.DefaultTo<false>;
  };
}

export interface SharedMetaSocial extends Schema.Component {
  collectionName: 'components_shared_meta_socials';
  info: {
    displayName: 'metaSocial';
    icon: 'project-diagram';
  };
  attributes: {
    socialNetwork: Attribute.Enumeration<['Facebook', 'Twitter']> &
      Attribute.Required;
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    description: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 65;
      }>;
    image: Attribute.Media;
  };
}

export interface SharedPublication extends Schema.Component {
  collectionName: 'components_shared_publications';
  info: {
    displayName: 'publication';
    icon: 'arrow-up';
  };
  attributes: {
    publish_at: Attribute.DateTime;
    ready: Attribute.Boolean & Attribute.DefaultTo<true>;
  };
}

export interface SharedQuestionAnswer extends Schema.Component {
  collectionName: 'components_shared_question_answers';
  info: {
    displayName: 'questionAnswer';
    icon: 'question-circle';
    description: '';
  };
  attributes: {
    question: Attribute.String;
    answer: Attribute.RichText;
  };
}

export interface SharedSeo extends Schema.Component {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    metaTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaDescription: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 50;
        maxLength: 160;
      }>;
    metaImage: Attribute.Media;
    metaSocial: Attribute.Component<'shared.meta-social', true>;
    keywords: Attribute.Text;
    metaRobots: Attribute.String;
    structuredData: Attribute.JSON;
    metaViewport: Attribute.String;
    canonicalURL: Attribute.String;
  };
}

export interface SharedSocialNetworks extends Schema.Component {
  collectionName: 'components_shared_social_network';
  info: {
    displayName: 'socialNetwork';
    icon: 'network-wired';
  };
  attributes: {
    url: Attribute.String & Attribute.Required;
  };
}

export interface SharedTeamCard extends Schema.Component {
  collectionName: 'components_shared_team_cards';
  info: {
    displayName: 'teamCard';
    icon: 'smile';
    description: '';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    description: Attribute.String & Attribute.Required;
    image: Attribute.Media;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'shared.button': SharedButton;
      'shared.card': SharedCard;
      'shared.comment': SharedComment;
      'shared.footer-columns': SharedFooterColumns;
      'shared.header': SharedHeader;
      'shared.link': SharedLink;
      'shared.meta-social': SharedMetaSocial;
      'shared.publication': SharedPublication;
      'shared.question-answer': SharedQuestionAnswer;
      'shared.seo': SharedSeo;
      'shared.social-networks': SharedSocialNetworks;
      'shared.team-card': SharedTeamCard;
    }
  }
}
