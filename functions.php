<?php

if (!defined('_S_VERSION')) {
    // Replace the version number of the theme on each release.
    define('_S_VERSION', '1.0.0');
}

if (!function_exists('cal_ai_inspired_setup')) :
    function cal_ai_inspired_setup()
    {
        load_theme_textdomain('cal-ai-inspired', get_template_directory() . '/languages');

        // Add default posts and comments RSS feed links to head.
        add_theme_support('automatic-feed-links');

        add_theme_support('title-tag');

        add_theme_support('post-thumbnails');

        // This theme uses wp_nav_menu() in one location.
        register_nav_menus(
            array(
                'menu-1' => esc_html__('Primary', 'cal-ai-inspired'),
            )
        );

        add_theme_support(
            'html5',
            array(
                'search-form',
                'comment-form',
                'comment-list',
                'gallery',
                'caption',
                'style',
                'script',
            )
        );

        // Set up the WordPress core custom background feature.
        add_theme_support(
            'custom-background',
            apply_filters(
                'cal_ai_inspired_custom_background_args',
                array(
                    'default-color' => 'ffffff',
                    'default-image' => '',
                )
            )
        );

        // Add theme support for selective refresh for widgets.
        add_theme_support('customize-selective-refresh-widgets');

        // Add support for core custom logo.
        add_theme_support(
            'custom-logo',
            array(
                'height'      => 250,
                'width'       => 250,
                'flex-width'  => true,
                'flex-height' => true,
            )
        );
    }
endif;
add_action('after_setup_theme', 'cal_ai_inspired_setup');

function cal_ai_inspired_content_width()
{
    $GLOBALS['content_width'] = apply_filters('cal_ai_inspired_content_width', 640);
}
add_action('after_setup_theme', 'cal_ai_inspired_content_width', 0);

function cal_ai_inspired_widgets_init()
{
    register_sidebar(
        array(
            'name'          => esc_html__('Sidebar', 'cal-ai-inspired'),
            'id'            => 'sidebar-1',
            'description'   => esc_html__('Add widgets here.', 'cal-ai-inspired'),
            'before_widget' => '<section id="%1$s" class="widget %2$s">',
            'after_widget'  => '</section>',
            'before_title'  => '<h2 class="widget-title">',
            'after_title'   => '</h2>',
        )
    );
}
add_action('widgets_init', 'cal_ai_inspired_widgets_init');

function cal_ai_inspired_scripts()
{
    wp_enqueue_style('cal-ai-inspired-style', get_stylesheet_uri(), array(), _S_VERSION);
    wp_enqueue_script('cal-ai-inspired-navigation', get_template_directory_uri() . '/js/navigation.js', array(), _S_VERSION, true);
}
add_action('wp_enqueue_scripts', 'cal_ai_inspired_scripts');

require get_template_directory() . '/inc/customizer.php';

require get_template_directory() . '/inc/template-tags.php';

require get_template_directory() . '/inc/template-functions.php';