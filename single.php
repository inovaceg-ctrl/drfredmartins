<?php get_header(); ?>

<main id="primary" class="site-main">
    <?php
    while (have_posts()) :
        the_post();
        ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <header class="entry-header">
                <?php the_title('<h1 class="entry-title">', '</h1>'); ?>
                <div class="entry-meta">
                    <?php
                    printf(
                        esc_html__('Posted on %s', 'cal-ai-inspired'),
                        '<time class="entry-date published" datetime="' . esc_attr(get_the_date('c')) . '">' . esc_html(get_the_date()) . '</time>'
                    );
                    ?>
                </div>
            </header>

            <div class="entry-content">
                <?php the_content(); ?>
            </div>

            <footer class="entry-footer">
                <?php
                $tags_list = get_the_tag_list('', esc_html_x(', ', 'list item separator', 'cal-ai-inspired'));
                if ($tags_list) {
                    printf('<span class="tags-links">' . esc_html__('Tagged %1$s', 'cal-ai-inspired') . '</span>', $tags_list);
                }
                ?>
            </footer>
        </article>

        <?php
        // If comments are open or we have at least one comment, load up the comment template.
        if (comments_open() || get_comments_number()) :
            comments_template();
        endif;

    endwhile;
    ?>
</main>

<?php get_sidebar(); ?>
<?php get_footer(); ?>